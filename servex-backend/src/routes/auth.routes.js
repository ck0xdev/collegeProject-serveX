const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Debug check: ensure controller functions exist
if (!authController.register || !authController.login) {
  console.error("❌ Auth Controller functions missing! Check auth.controller.js exports.");
}

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp);
router.post('/google-login', authController.googleLogin);

// Protected Routes
router.post('/create-admin', authController.createAdmin); // Check if you implemented this in controller

module.exports = router;