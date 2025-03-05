import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);
  const [cartRestaurantInfo, setCartRestaurantInfo] = useState(null);

  // Load cart from storage on app start
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await SecureStore.getItemAsync('cartItems');
        const savedRestaurantId = await SecureStore.getItemAsync('cartRestaurantId');
        const savedRestaurantInfo = await SecureStore.getItemAsync('cartRestaurantInfo');
        
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        
        if (savedRestaurantId) {
          setCartRestaurantId(savedRestaurantId);
        }
        
        if (savedRestaurantInfo) {
          setCartRestaurantInfo(JSON.parse(savedRestaurantInfo));
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await SecureStore.setItemAsync('cartItems', JSON.stringify(cartItems));
        
        if (cartRestaurantId) {
          await SecureStore.setItemAsync('cartRestaurantId', cartRestaurantId);
        } else {
          await SecureStore.deleteItemAsync('cartRestaurantId');
        }
        
        if (cartRestaurantInfo) {
          await SecureStore.setItemAsync('cartRestaurantInfo', JSON.stringify(cartRestaurantInfo));
        } else {
          await SecureStore.deleteItemAsync('cartRestaurantInfo');
        }
      } catch (error) {
        console.error('Error saving cart to storage:', error);
      }
    };
    
    saveCart();
  }, [cartItems, cartRestaurantId, cartRestaurantInfo]);

  const addToCart = (item, restaurantId, restaurantInfo) => {
    // Check if adding from a different restaurant
    if (cartRestaurantId && cartRestaurantId !== restaurantId && cartItems.length > 0) {
      Alert.alert(
        'Novo Restaurante',
        'Seu carrinho contém itens de outro restaurante. Deseja limpar o carrinho e adicionar este item?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Limpar e Adicionar', 
            style: 'destructive',
            onPress: () => {
              setCartItems([{ ...item, quantity: 1 }]);
              setCartRestaurantId(restaurantId);
              setCartRestaurantInfo(restaurantInfo);
            }
          }
        ]
      );
      return;
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      setCartItems(updatedItems);
    } else {
      // Add new item with quantity 1
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    
    // Set restaurant ID if not already set
    if (!cartRestaurantId) {
      setCartRestaurantId(restaurantId);
      setCartRestaurantInfo(restaurantInfo);
    }
    
    Alert.alert('Item adicionado ao carrinho!');
  };

  const removeFromCart = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    
    // If cart is empty, reset restaurant info
    if (updatedItems.length === 0) {
      setCartRestaurantId(null);
      setCartRestaurantInfo(null);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    setCartRestaurantId(null);
    setCartRestaurantInfo(null);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartRestaurantId,
        cartRestaurantInfo,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
