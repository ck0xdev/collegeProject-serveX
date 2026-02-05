// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Protected route - Get user profile
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Profile fetched successfully',
    data: {
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Admin only route
router.get('/admin/dashboard', verifyToken, isAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin dashboard',
    data: {
      user: req.user
    }
  });
});

module.exports = router;