import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useOrder } from '../contexts/OrderContext';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { orders, fetchOrders, loading, error } = useOrder();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'Pendente',
      PREPARING: 'Preparando',
      READY: 'Pronto',
      DELIVERING: 'Em entrega',
      DELIVERED: 'Entregue',
      CANCELLED: 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColorMap = {
      PENDING: '#FFA500',
      PREPARING: '#3498DB',
      READY: '#9B59B6',
      DELIVERING: '#2ECC71',
      DELIVERED: '#27AE60',
      CANCELLED: '#E74C3C'
    };
    return statusColorMap[status] || '#666';
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.restaurantName}>{item.restaurant?.name || 'Restaurante'}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.orderSummary}>
        <Text style={styles.orderItems}>
          {item.items.map(i => `${i.quantity}x ${i.dish?.name || 'Item'}`).join(', ')}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
        <View style={styles.orderAction}>
          <Text style={styles.orderActionText}>Ver detalhes</Text>
          <Ionicons name="chevron-forward" size={16} color="#FF4500" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptyText}>
        Seus pedidos aparecerão aqui quando você fizer seu primeiro pedido.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Explorar restaurantes</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrders}
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={orders.length === 0 ? { flex: 1 } : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF4500']}
              tintColor="#FF4500"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderSummary: {
    marginBottom: 10,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderActionText: {
    fontSize: 14,
    color: '#FF4500',
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
