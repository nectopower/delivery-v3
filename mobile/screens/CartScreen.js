import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cartItems, cartRestaurantInfo, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Necessário',
        'Você precisa estar logado para finalizar o pedido.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Fazer Login', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }
    
    if (cartItems.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho antes de finalizar o pedido.');
      return;
    }
    
    navigation.navigate('Checkout');
  };
  
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    Alert.alert(
      'Limpar carrinho',
      'Tem certeza que deseja limpar o carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearCart }
      ]
    );
  };
  
  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remover item',
      'Tem certeza que deseja remover este item do carrinho?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => removeFromCart(itemId) }
      ]
    );
  };
  
  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    updateQuantity(itemId, newQuantity);
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearCartText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtext}>
            Adicione itens de um restaurante para começar um pedido
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Explorar Restaurantes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Restaurant Info */}
          {cartRestaurantInfo && (
            <TouchableOpacity
              style={styles.restaurantCard}
              onPress={() => navigation.navigate('Restaurant', { restaurantId: cartRestaurantInfo.id })}
            >
              <Image
                source={{ uri: cartRestaurantInfo.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{cartRestaurantInfo.name}</Text>
                <View style={styles.restaurantDetails}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{cartRestaurantInfo.rating?.toFixed(1) || '0.0'}</Text>
                  </View>
                  <Text style={styles.restaurantAddress} numberOfLines={1}>
                    {cartRestaurantInfo.address}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
          
          {/* Cart Items */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>Itens do Pedido</Text>
            
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image
                  source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                  
                  {item.notes && (
                    <Text style={styles.itemNotes} numberOfLines={1}>
                      {item.notes}
                    </Text>
                  )}
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
                    >
                      <Ionicons name="remove" size={16} color="#FF4500" />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
                    >
                      <Ionicons name="add" size={16} color="#FF4500" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4500" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Resumo</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCurrency(getCartTotal())}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de entrega</Text>
                <Text style={styles.summaryValue}>Calculado no checkout</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(getCartTotal())}</Text>
              </View>
              
              <Text style={styles.deliveryNote}>
                * Taxa de entrega será calculada na finalização do pedido
              </Text>
            </View>
          </View>
          
          <View style={styles.bottomSpace} />
        </ScrollView>
      )}
      
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerTotal}>
              <Text style={styles.footerTotalLabel}>Total</Text>
              <Text style={styles.footerTotalValue}>{formatCurrency(getCartTotal())}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearCartText: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
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
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemNotes: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  removeButton: {
    padding: 10,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
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
  deliveryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTotal: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 14,
    color: '#666',
  },
  footerTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomSpace: {
    height: 80,
  },
});

export default CartScreen;
