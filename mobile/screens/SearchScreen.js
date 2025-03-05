import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../services/api';

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [searchQuery, setSearchQuery] = useState(route.params?.query || '');
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurants');
  
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, []);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Search restaurants
      const restaurantsResponse = await api.get('/restaurant');
      const filteredRestaurants = restaurantsResponse.data.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.categories.some(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setRestaurants(filteredRestaurants);
      
      // Search dishes across all restaurants
      const allDishes = [];
      for (const restaurant of restaurantsResponse.data) {
        const dishesResponse = await api.get(`/dishes/restaurant/${restaurant.id}`);
        const filteredDishes = dishesResponse.data.filter(dish => 
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Add restaurant info to each dish
        const dishesWithRestaurant = filteredDishes.map(dish => ({
          ...dish,
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            imageUrl: restaurant.imageUrl
          }
        }));
        
        allDishes.push(...dishesWithRestaurant);
      }
      
      setDishes(allDishes);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({item.ratingCount})</Text>
        </View>
        <Text style={styles.restaurantCategories}>
          {item.categories.map(cat => cat.name).join(' • ')}
        </Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.deliveryTime} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bicycle-outline" size={14} color="#666" />
            <Text style={styles.metaText}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(item.deliveryFee)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dishCard}
      onPress={() => navigation.navigate('Restaurant', { 
        restaurantId: item.restaurantId,
        highlightDishId: item.id
      })}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
        style={styles.dishImage}
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.dishPrice}>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(item.price)}
        </Text>
        <Text style={styles.dishRestaurant}>
          {item.restaurant.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes ou pratos"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={!route.params?.query}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {searchQuery ? (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'restaurants' && styles.activeTab
              ]}
              onPress={() => setActiveTab('restaurants')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'restaurants' && styles.activeTabText
                ]}
              >
                Restaurantes ({restaurants.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'dishes' && styles.activeTab
              ]}
              onPress={() => setActiveTab('dishes')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'dishes' && styles.activeTabText
                ]}
              >
                Pratos ({dishes.length})
              </Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles.loadingText}>Buscando...</Text>
            </View>
          ) : (
            activeTab === 'restaurants' ? (
              restaurants.length > 0 ? (
                <FlatList
                  data={restaurants}
                  renderItem={renderRestaurantItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="restaurant-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>
                    Nenhum restaurante encontrado para "{searchQuery}"
                  </Text>
                </View>
              )
            ) : (
              dishes.length > 0 ? (
                <FlatList
                  data={dishes}
                  renderItem={renderDishItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="fast-food-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>
                    Nenhum prato encontrado para "{searchQuery}"
                  </Text>
                </View>
              )
            )
          )}
        </>
      ) : (
        <View style={styles.initialContainer}>
          <Ionicons name="search" size={80} color="#ddd" />
          <Text style={styles.initialText}>
            Busque por restaurantes, pratos ou categorias
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  restaurantCategories: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dishImage: {
    width: 100,
    height: 100,
  },
  dishInfo: {
    flex: 1,
    padding: 10,
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dishDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4500',
    marginBottom: 5,
  },
  dishRestaurant: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initialText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchScreen;
