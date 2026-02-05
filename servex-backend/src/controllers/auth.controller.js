// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { sendOTPEmail } = require('../config/email.config');

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER - Create new user and send OTP
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      email,
      name,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false
    });

    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'User created but failed to send OTP email'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP',
      data: {
        email,
        name
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check OTP expiry
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Update user as verified
    await User.update(email, {
      isVerified: true,
      otp: null,
      otpExpiry: null
    });

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// RESEND OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    await User.update(email, { otp, otpExpiry });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully!'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
};

// CREATE ADMIN - Special endpoint to create admin users
exports.createAdmin = async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;

    // Secret key verification (for security)
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ServeX_Admin_2026_SuperSecret';
    
    if (secretKey !== ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin secret key'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user (no OTP verification needed)
    const user = new User({
      email,
      name,
      password: hashedPassword,
      role: 'admin', // Set as admin
      isVerified: true, // Auto-verify admin
      otp: null,
      otpExpiry: null
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
  // GOOGLE SIGN-IN
exports.googleLogin = async (req, res) => {
  try {
    const { uid, email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    let user = await User.findByEmail(email);

    if (!user) {
      // Create new user (auto-verified since Google verified them)
      const newUser = new User({
        email,
        name: name || 'Google User',
        password: await bcrypt.hash(uid, 10), // Use uid as password (they won't use it)
        role: 'client',
        isVerified: true, // Auto-verify Google users
        otp: null,
        otpExpiry: null
      });

      await newUser.save();
      user = await User.findByEmail(email);
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful!',
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google sign-in failed',
      error: error.message
    });
  }
};
};