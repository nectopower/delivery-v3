import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import api from '../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, logout, updateProfile } = useAuth();
  const { savedLocations } = useLocation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);
  
  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            const success = await logout();
            if (success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }
        }
      ]
    );
  };
  
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome não pode estar vazio');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await updateProfile({
        name,
        phone,
        notificationsEnabled
      });
      
      if (success) {
        setIsEditing(false);
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o perfil');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const formatPhone = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    let formatted = cleaned;
    if (cleaned.length > 0) {
      formatted = cleaned.replace(/^(\d{2})(\d)/g, '($1) $2');
      formatted = formatted.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    return formatted;
  };
  
  const handlePhoneChange = (text) => {
    setPhone(formatPhone(text));
  };
  
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>
        
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.notLoggedInText}>
            Faça login para acessar seu perfil
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {!isEditing ? (
            <Text style={styles.userName}>{currentUser.name}</Text>
          ) : (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.editNameInput}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
              />
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#666" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefone</Text>
              {!isEditing ? (
                <Text style={styles.infoValue}>{phone || 'Não informado'}</Text>
              ) : (
                <TextInput
                  style={styles.editInput}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Seu telefone"
                  keyboardType="phone-pad"
                />
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereços Salvos</Text>
          
          {savedLocations.length > 0 ? (
            savedLocations.map((location, index) => (
              <View key={index} style={styles.addressItem}>
                <View style={styles.addressIcon}>
                  <Ionicons 
                    name={location.type === 'home' ? 'home-outline' : 'business-outline'} 
                    size={20} 
                    color="#666" 
                  />
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressTitle}>
                    {location.title || (location.type === 'home' ? 'Casa' : 'Trabalho')}
                  </Text>
                  <Text style={styles.addressValue}>
                    {location.street}, {location.number}
                    {location.complement ? `, ${location.complement}` : ''}
                  </Text>
                  <Text style={styles.addressValue}>
                    {location.neighborhood}, {location.city} - {location.state}
                  </Text>
                </View>
                <TouchableOpacity style={styles.addressAction}>
                  <Ionicons name="create-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyAddressContainer}>
              <Text style={styles.emptyAddressText}>
                Você não tem endereços salvos
              </Text>
              <TouchableOpacity style={styles.addAddressButton}>
                <Text style={styles.addAddressButtonText}>Adicionar Endereço</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Notificações de pedidos</Text>
              <Text style={styles.preferenceDescription}>
                Receba atualizações sobre seus pedidos
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#FF4500' }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                // Reset to original values
                if (currentUser) {
                  setName(currentUser.name || '');
                  setPhone(currentUser.phone || '');
                }
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4500" />
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editText: {
    color: '#FF4500',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editNameContainer: {
    width: '100%',
    maxWidth: 250,
  },
  editNameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  addressItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addressContent: {
    flex: 1,
    justifyContent: 'center',
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  addressValue: {
    fontSize: 14,
    color: '#666',
  },
  addressAction: {
    justifyContent: 'center',
    padding: 10,
  },
  emptyAddressContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  emptyAddressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  addAddressButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAddressButtonText: {
    color: '#FF4500',
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF4500',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FF4500',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FF4500',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomSpace: {
    height: 80,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
