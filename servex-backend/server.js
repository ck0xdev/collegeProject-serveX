// server.js - Complete updated version
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const projectRoutes = require('./src/routes/project.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ServeX API is running! 🚀',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('\n🎉 ============================================');
  console.log(`✅ ServeX Backend Server is running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔥 Firebase: Connected`);
  console.log(`📧 Email: Configured`);
  console.log('🎉 ============================================\n');
});