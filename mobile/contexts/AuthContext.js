import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkLoginStatus = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        const userData = await SecureStore.getItemAsync('userData');
        
        if (userToken && userData) {
          setIsAuthenticated(true);
          setCurrentUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync('userToken', access_token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      setIsAuthenticated(true);
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync('userToken', access_token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      setIsAuthenticated(true);
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      
      setIsAuthenticated(false);
      setCurrentUser(null);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/customer/profile', userData);
      
      const updatedUser = response.data;
      await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
      
      setCurrentUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
