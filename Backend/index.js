const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const bookRoutes = require('./src/Books/book.route');
const orderRoutes = require('./src/Order/order.route');
const userRoutes = require('./src/user/user.route');
const reviewRoutes = require('./src/Review/review.route');
const AdminRoutes = require('./src/stats/Admin.stats');
const chatRoutes = require('./src/Chat/chat.route');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api', chatRoutes);

// Database connection
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Book Store API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Something broke!', error: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});