import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved locations on app start
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const savedCurrentLocation = await SecureStore.getItemAsync('currentLocation');
        const savedLocationsList = await SecureStore.getItemAsync('savedLocations');
        
        if (savedCurrentLocation) {
          setCurrentLocation(JSON.parse(savedCurrentLocation));
        }
        
        if (savedLocationsList) {
          setSavedLocations(JSON.parse(savedLocationsList));
        }
      } catch (error) {
        console.error('Error loading locations from storage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocations();
  }, []);

  // Save locations whenever they change
  useEffect(() => {
    const saveLocations = async () => {
      try {
        if (currentLocation) {
          await SecureStore.setItemAsync('currentLocation', JSON.stringify(currentLocation));
        }
        
        await SecureStore.setItemAsync('savedLocations', JSON.stringify(savedLocations));
      } catch (error) {
        console.error('Error saving locations to storage:', error);
      }
    };
    
    saveLocations();
  }, [currentLocation, savedLocations]);

  const setLocation = (location) => {
    setCurrentLocation(location);
  };

  const addSavedLocation = (location) => {
    // Check if location already exists by address
    const exists = savedLocations.some(
      loc => loc.address === location.address
    );
    
    if (!exists) {
      setSavedLocations([...savedLocations, location]);
    }
  };

  const removeSavedLocation = (locationId) => {
    setSavedLocations(savedLocations.filter(loc => loc.id !== locationId));
  };

  const updateSavedLocation = (locationId, updatedLocation) => {
    setSavedLocations(
      savedLocations.map(loc => 
        loc.id === locationId ? { ...loc, ...updatedLocation } : loc
      )
    );
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        savedLocations,
        loading,
        setLocation,
        addSavedLocation,
        removeSavedLocation,
        updateSavedLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
