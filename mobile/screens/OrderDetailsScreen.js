import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrder } from '../contexts/OrderContext';
import api from '../services/api';

const OrderDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { cancelOrder } = useOrder();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Não foi possível carregar os detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelOrder = async () => {
    Alert.alert(
      'Cancelar Pedido',
      'Tem certeza que deseja cancelar este pedido?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim, cancelar', 
          style: 'destructive',
          onPress: async () => {
            setCancelLoading(true);
            try {
              await cancelOrder(orderId);
              // Refresh order details
              fetchOrderDetails();
              Alert.alert('Sucesso', 'Pedido cancelado com sucesso');
            } catch (err) {
              console.error('Error cancelling order:', err);
              Alert.alert('Erro', 'Não foi possível cancelar o pedido');
            } finally {
              setCancelLoading(false);
            }
          }
        }
      ]
    );
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
  
  const canCancel = (status) => {
    return status === 'PENDING';
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Carregando detalhes do pedido...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrderDetails}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pedido não encontrado</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
            <Text style={styles.orderNumber}>Pedido #{order.id.substring(0, 8)}</Text>
          </View>
          
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        
        {/* Restaurant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurante</Text>
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('Restaurant', { restaurantId: order.restaurant.id })}
          >
            {order.restaurant.imageUrl && (
              <Image
                source={{ uri: order.restaurant.imageUrl }}
                style={styles.restaurantImage}
              />
            )}
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
              <Text style={styles.restaurantAddress} numberOfLines={2}>
                {order.restaurant.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.dish.name}</Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>{item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={20} color="#FF4500" style={styles.addressIcon} />
            <View style={styles.addressInfo}>
              <Text style={styles.addressText}>{order.deliveryAddress.street}, {order.deliveryAddress.number}</Text>
              {order.deliveryAddress.complement && (
                <Text style={styles.addressComplement}>{order.deliveryAddress.complement}</Text>
              )}
              <Text style={styles.addressCity}>
                {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} - {order.deliveryAddress.state}
              </Text>
              <Text style={styles.addressZip}>{order.deliveryAddress.zipCode}</Text>
            </View>
          </View>
        </View>
        
        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagamento</Text>
          <View style={styles.paymentCard}>
            <Ionicons 
              name={order.paymentMethod === 'CREDIT_CARD' ? 'card-outline' : 'cash-outline'} 
              size={20} 
              color="#FF4500" 
              style={styles.paymentIcon} 
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentMethod}>
                {order.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Dinheiro'}
              </Text>
              {order.paymentMethod === 'CASH' && order.changeFor && (
                <Text style={styles.changeText}>Troco para: {formatCurrency(order.changeFor)}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
            </View>
            
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto</Text>
                <Text style={styles.discountValue}>-{formatCurrency(order.discount)}</Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
          </View>
        </View>
        
        {/* Cancel Button */}
        {canCancel(order.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
            )}
          </TouchableOpacity>
        )}
        
        {/* Delivery Person */}
        {order.status === 'DELIVERING' && order.deliveryPerson && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entregador</Text>
            <View style={styles.deliveryPersonCard}>
              {order.deliveryPerson.imageUrl ? (
                <Image
                  source={{ uri: order.deliveryPerson.imageUrl }}
                  style={styles.deliveryPersonImage}
                />
              ) : (
                <View style={styles.deliveryPersonImagePlaceholder}>
                  <Ionicons name="person" size={30} color="#fff" />
                </View>
              )}
              
              <View style={styles.deliveryPersonInfo}>
                <Text style={styles.deliveryPersonName}>{order.deliveryPerson.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {order.deliveryPerson.rating ? order.deliveryPerson.rating.toFixed(1) : '0.0'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemQuantity: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityText: {
    fontWeight: 'bold',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  addressIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressComplement: {
    fontSize: 14,
    marginBottom: 5,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  addressZip: {
    fontSize: 14,
    color: '#666',
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  paymentIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  changeText: {
    fontSize: 14,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
  },
  discountValue: {
    fontSize: 14,
    color: '#27AE60',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  cancelButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    padding: 15,
    margin: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deliveryPersonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  deliveryPersonImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  deliveryPersonImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deliveryPersonInfo: {
    flex: 1,
  },
  deliveryPersonName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  callButton: {
    backgroundColor: '#27AE60',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomSpace: {
    height: 50,
  },
});

export default OrderDetailsScreen;
