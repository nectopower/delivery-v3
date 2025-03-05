import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import api from '../services/api';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const { currentLocation } = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [currentLocation]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesResponse = await api.get('/categories');
      setCategories(categoriesResponse.data);
      
      // Fetch restaurants
      const params = currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude
      } : {};
      
      const restaurantsResponse = await api.get('/restaurant', { params });
      setRestaurants(restaurantsResponse.data);
      
      // Set featured restaurants (top rated)
      const featured = [...restaurantsResponse.data]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
      setFeaturedRestaurants(featured);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };
  
  const filterRestaurantsByCategory = (categoryId) => {
    if (categoryId === selectedCategory) {
      // If the same category is selected again, clear the filter
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };
  
  const filteredRestaurants = selectedCategory
    ? restaurants.filter(restaurant => 
        restaurant.categories.some(category => category.id === selectedCategory)
      )
    : restaurants;
  
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
        {item.distance && (
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.distanceText}>{(item.distance / 1000).toFixed(1)} km</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => filterRestaurantsByCategory(item.id)}
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
  
  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('Restaurant', { restaurantId: item.id })}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredName}>{item.name}</Text>
        <View style={styles.featuredRating}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.featuredRatingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Carregando restaurantes...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color="#FF4500" />
            <Text style={styles.locationText} numberOfLines={1}>
              {currentLocation
                ? `${currentLocation.street}, ${currentLocation.number}`
                : 'Definir localização'}
            </Text>
            <TouchableOpacity>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={30} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar restaurantes ou pratos"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>
        
        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            Olá, {currentUser ? currentUser.name.split(' ')[0] : 'Visitante'}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            O que você quer comer hoje?
          </Text>
        </View>
        
        {/* Categories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        {/* Featured Restaurants */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Destaques</Text>
          <FlatList
            data={featuredRestaurants}
            renderItem={renderFeaturedItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
        
        {/* All Restaurants */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name || 'Restaurantes'}`
              : 'Todos os Restaurantes'}
          </Text>
          
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map(restaurant => (
              <View key={restaurant.id}>
                {renderRestaurantItem({ item: restaurant })}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                Nenhum restaurante encontrado
              </Text>
            </View>
          )}
        </View>
        
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
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 5,
    flex: 1,
  },
  profileButton: {
    padding: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  welcomeContainer: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryItem: {
    backgroundColor: '#FF4500',
    borderColor: '#FF4500',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  featuredList: {
    paddingHorizontal: 15,
  },
  featuredCard: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
  },
  featuredName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  featuredRatingText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
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
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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

export default HomeScreen;
