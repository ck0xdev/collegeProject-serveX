// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { handleValidationErrors } = require('../middleware/validate.middleware');

// Validation rules
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateOTP = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

const validateResendOTP = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const validateAdminCreation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('secretKey').trim().notEmpty().withMessage('Admin secret key required')
];

// Routes
router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/verify-otp', validateOTP, handleValidationErrors, authController.verifyOTP);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/resend-otp', validateResendOTP, handleValidationErrors, authController.resendOTP);
router.post('/create-admin', validateAdminCreation, handleValidationErrors, authController.createAdmin);
router.post('/google-login', authController.googleLogin);

module.exports = router;