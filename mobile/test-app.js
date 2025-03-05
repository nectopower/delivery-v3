const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Mock data
const restaurants = [
  {
    id: '1',
    name: 'Restaurante Italiano',
    description: 'Comida italiana autêntica',
    imageUrl: 'https://via.placeholder.com/500x300?text=Restaurante+Italiano',
    address: 'Rua das Flores, 123',
    rating: 4.7,
    ratingCount: 253,
    deliveryTime: 30,
    deliveryFee: 5.99,
    categories: [
      { id: '1', name: 'Italiano' },
      { id: '2', name: 'Pizza' }
    ]
  },
  {
    id: '2',
    name: 'Sushi Express',
    description: 'O melhor sushi da cidade',
    imageUrl: 'https://via.placeholder.com/500x300?text=Sushi+Express',
    address: 'Av. Paulista, 1000',
    rating: 4.5,
    ratingCount: 187,
    deliveryTime: 45,
    deliveryFee: 7.99,
    categories: [
      { id: '3', name: 'Japonês' },
      { id: '4', name: 'Sushi' }
    ]
  },
  {
    id: '3',
    name: 'Burger King',
    description: 'Hambúrgueres suculentos',
    imageUrl: 'https://via.placeholder.com/500x300?text=Burger+King',
    address: 'Rua Augusta, 500',
    rating: 4.2,
    ratingCount: 342,
    deliveryTime: 25,
    deliveryFee: 4.99,
    categories: [
      { id: '5', name: 'Hambúrguer' },
      { id: '6', name: 'Fast Food' }
    ]
  }
];

const categories = [
  { id: '1', name: 'Italiano' },
  { id: '2', name: 'Pizza' },
  { id: '3', name: 'Japonês' },
  { id: '4', name: 'Sushi' },
  { id: '5', name: 'Hambúrguer' },
  { id: '6', name: 'Fast Food' },
  { id: '7', name: 'Vegetariano' },
  { id: '8', name: 'Sobremesas' }
];

const dishes = [
  // Restaurante Italiano
  {
    id: '101',
    restaurantId: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco',
    price: 39.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Pizza+Margherita',
    category: { id: '2', name: 'Pizza' }
  },
  {
    id: '102',
    restaurantId: '1',
    name: 'Lasanha à Bolonhesa',
    description: 'Camadas de massa, molho bolonhesa, molho branco e queijo',
    price: 45.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Lasanha',
    category: { id: '1', name: 'Italiano' }
  },
  {
    id: '103',
    restaurantId: '1',
    name: 'Espaguete Carbonara',
    description: 'Espaguete com molho cremoso, bacon e parmesão',
    price: 42.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Espaguete',
    category: { id: '1', name: 'Italiano' }
  },
  
  // Sushi Express
  {
    id: '201',
    restaurantId: '2',
    name: 'Combo 30 Peças',
    description: 'Mix de sushis e sashimis (30 peças)',
    price: 89.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Combo+Sushi',
    category: { id: '4', name: 'Sushi' }
  },
  {
    id: '202',
    restaurantId: '2',
    name: 'Temaki Salmão',
    description: 'Cone de alga com arroz, salmão e cream cheese',
    price: 25.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Temaki',
    category: { id: '4', name: 'Sushi' }
  },
  
  // Burger King
  {
    id: '301',
    restaurantId: '3',
    name: 'Whopper',
    description: 'Hambúrguer com alface, tomate, cebola, picles, maionese e ketchup',
    price: 32.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Whopper',
    category: { id: '5', name: 'Hambúrguer' }
  },
  {
    id: '302',
    restaurantId: '3',
    name: 'Onion Rings',
    description: 'Anéis de cebola empanados e fritos',
    price: 15.90,
    imageUrl: 'https://via.placeholder.com/300x200?text=Onion+Rings',
    category: { id: '6', name: 'Fast Food' }
  }
];

const users = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    password: '123456',
    role: 'CUSTOMER',
    phone: '(11) 98765-4321'
  }
];

// Auth routes
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      access_token: 'mock_token_' + Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } else {
    res.status(401).json({ message: 'Email ou senha incorretos' });
  }
});

app.post('/auth/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email já cadastrado' });
  }
  
  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
    role: 'CUSTOMER',
    phone
  };
  
  users.push(newUser);
  
  res.status(201).json({
    access_token: 'mock_token_' + Date.now(),
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone
    }
  });
});

// Restaurant routes
app.get('/restaurant', (req, res) => {
  res.json(restaurants);
});

app.get('/restaurant/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  
  if (restaurant) {
    res.json(restaurant);
  } else {
    res.status(404).json({ message: 'Restaurante não encontrado' });
  }
});

// Categories routes
app.get('/categories', (req, res) => {
  res.json(categories);
});

// Dishes routes
app.get('/dishes/restaurant/:restaurantId', (req, res) => {
  const restaurantDishes = dishes.filter(d => d.restaurantId === req.params.restaurantId);
  res.json(restaurantDishes);
});

// Orders routes
let orders = [];

app.get('/orders/customer', (req, res) => {
  res.json(orders);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Pedido não encontrado' });
  }
});

app.post('/orders', (req, res) => {
  const { restaurantId, items, deliveryAddress, paymentMethod, total } = req.body;
  
  const restaurant = restaurants.find(r => r.id === restaurantId);
  
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurante não encontrado' });
  }
  
  const newOrder = {
    id: String(Date.now()),
    restaurantId,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      imageUrl: restaurant.imageUrl
    },
    items,
    deliveryAddress,
    paymentMethod,
    total,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  
  orders.unshift(newOrder);
  
  res.status(201).json(newOrder);
});

app.post('/orders/:id/cancel', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  
  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    return res.status(400).json({ message: 'Este pedido não pode ser cancelado' });
  }
  
  order.status = 'CANCELLED';
  
  res.json(order);
});

app.post('/orders/:id/rate', (req, res) => {
  const { rating, comment } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Pedido não encontrado' });
  }
  
  if (order.status !== 'DELIVERED') {
    return res.status(400).json({ message: 'Apenas pedidos entregues podem ser avaliados' });
  }
  
  order.rating = rating;
  order.comment = comment;
  
  res.json(order);
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});
