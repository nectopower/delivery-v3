import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const RestaurantScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  const { addToCart, cartItems, cartRestaurantId } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);
  
  const fetchRestaurantDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch restaurant details
      const restaurantResponse = await api.get(`/restaurant/${restaurantId}`);
      setRestaurant(restaurantResponse.data);
      
      // Fetch restaurant dishes
      const dishesResponse = await api.get(`/dishes/restaurant/${restaurantId}`);
      setDishes(dishesResponse.data);
      
      // Extract unique categories from dishes
      const uniqueCategories = [];
      const categoryIds = new Set();
      
      dishesResponse.data.forEach(dish => {
        if (dish.category && !categoryIds.has(dish.category.id)) {
          categoryIds.add(dish.category.id);
          uniqueCategories.push(dish.category);
        }
      });
      
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError('Não foi possível carregar os detalhes do restaurante');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = (dish) => {
    addToCart(dish, restaurantId, restaurant);
  };
  
  const handleCategorySelect = (categoryId) => {
    if (categoryId === selectedCategory) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };
  
  const filteredDishes = dishes.filter(dish => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === null || dish.category?.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group dishes by category
  const dishesByCategory = {};
  
  if (selectedCategory) {
    // If a category is selected, only show that category
    const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'Outros';
    dishesByCategory[categoryName] = filteredDishes;
  } else {
    // Otherwise, group by category
    filteredDishes.forEach(dish => {
      const categoryName = dish.category?.name || 'Outros';
      if (!dishesByCategory[categoryName]) {
        dishesByCategory[categoryName] = [];
      }
      dishesByCategory[categoryName].push(dish);
    });
  }
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderDishItem = (dish) => (
    <TouchableOpacity
      key={dish.id}
      style={styles.dishCard}
      onPress={() => {
        // Show dish details or add to cart directly
        handleAddToCart(dish);
      }}
    >
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{dish.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {dish.description}
        </Text>
        <Text style={styles.dishPrice}>{formatCurrency(dish.price)}</Text>
      </View>
      
      {dish.imageUrl && (
        <Image
          source={{ uri: dish.imageUrl }}
          style={styles.dishImage}
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddToCart(dish)}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Carregando restaurante...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchRestaurantDetails}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurante não encontrado</Text>
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
      {/* Restaurant Header */}
      <View style={styles.restaurantHeader}>
        <Image
          source={{ uri: restaurant.imageUrl || 'https://via.placeholder.com/500' }}
          style={styles.headerImage}
        />
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerOverlay}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            
            <View style={styles.restaurantDetails}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({restaurant.ratingCount})</Text>
              </View>
              
              {restaurant.categories && (
                <Text style={styles.restaurantCategories}>
                  {restaurant.categories.map(cat => cat.name).join(' • ')}
                </Text>
              )}
            </View>
            
            <View style={styles.restaurantMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#fff" />
                <Text style={styles.metaText}>
                  {restaurant.deliveryTime} min
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="bicycle-outline" size={16} color="#fff" />
                <Text style={styles.metaText}>
                  {formatCurrency(restaurant.deliveryFee)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pratos"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}
      
      {/* Dishes */}
      <ScrollView style={styles.content}>
        {Object.keys(dishesByCategory).length > 0 ? (
          Object.entries(dishesByCategory).map(([categoryName, categoryDishes]) => (
            <View key={categoryName} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
              {categoryDishes.map(dish => renderDishItem(dish))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              Nenhum prato encontrado
            </Text>
          </View>
        )}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Cart Button */}
      {cartItems.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={styles.cartButtonContent}>
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </Text>
            </View>
            <Text style={styles.cartButtonText}>Ver Carrinho</Text>
            <Text style={styles.cartButtonPrice}>
              {formatCurrency(cartItems.reduce((total, item) => total + (item.price * item.quantity), 0))}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  restaurantHeader: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
  },
  restaurantInfo: {
    width: '100%',
  },
  restaurantName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  ratingCount: {
    color: '#ddd',
    fontSize: 12,
    marginLeft: 5,
  },
  restaurantCategories: {
    color: '#ddd',
    fontSize: 14,
  },
  restaurantMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedCategoryItem: {
    backgroundColor: '#FF4500',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  dishInfo: {
    flex: 1,
    marginRight: 80,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    position: 'absolute',
    right: 15,
    top: 15,
  },
  addButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: '#FF4500',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FF4500',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCount: {
    backgroundColor: '#fff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cartCountText: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  cartButtonPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  bottomSpace: {
    height: 80,
  },
});

export default RestaurantScreen;
