import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/orders/customer');
      setOrders(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Não foi possível carregar seus pedidos');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/orders/${orderId}`);
      setCurrentOrder(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Não foi possível carregar os detalhes do pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/orders', orderData);
      
      // Add the new order to the orders list
      setOrders(prevOrders => [response.data, ...prevOrders]);
      
      // Set as current order
      setCurrentOrder(response.data);
      
      return response.data;
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Não foi possível criar o pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      
      // Update the order in the orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? response.data : order
        )
      );
      
      // Update current order if it's the same
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error canceling order:', err);
      setError('Não foi possível cancelar o pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rateOrder = async (orderId, rating, comment) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/orders/${orderId}/rate`, { rating, comment });
      
      // Update the order in the orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? response.data : order
        )
      );
      
      // Update current order if it's the same
      if (currentOrder && currentOrder.id === orderId) {
        setCurrentOrder(response.data);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error rating order:', err);
      setError('Não foi possível avaliar o pedido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        currentOrder,
        loading,
        error,
        fetchOrders,
        fetchOrderDetails,
        createOrder,
        cancelOrder,
        rateOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
