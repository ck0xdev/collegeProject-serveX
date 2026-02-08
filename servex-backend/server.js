// server.js - Socket.io Enabled
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // Import HTTP
const { Server } = require('socket.io'); // Import Socket.io

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const projectRoutes = require('./src/routes/project.routes');
const chatRoutes = require('./src/routes/chat.routes'); // New Chat Routes

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:4200",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Make io accessible in routes (so controllers can emit events)
app.set('io', io);

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  // Join a personal room based on User ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room: ${userId}`);
  });

  // Join a specific project room (optional, for group chat later)
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`📁 User joined project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'ServeX API is running! 🚀',
    version: '1.0.0',
    socket: 'active'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes); // Register Chat Routes

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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

// Start Server (Use server.listen instead of app.listen)
server.listen(PORT, () => {
  console.log('\n🎉 ============================================');
  console.log(`✅ ServeX Backend Server is running!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⚡ Socket.io: Ready`);
  console.log('🎉 ============================================\n');
});