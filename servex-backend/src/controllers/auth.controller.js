// src/controllers/auth.controller.js
// ✅ CORRECT IMPORT: Get initialized db and admin from config
const { admin, db } = require('../config/firebase.config'); 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// const User = require('../models/user.model'); // Optional if you use db directly

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper: Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { uid: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// 1. REGISTER
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'client',
      isVerified: false,
      otp,
      otpExpires,
      createdAt: new Date().toISOString()
    };

    await userRef.set(newUser);

    await transporter.sendMail({
      from: `"ServeX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your ServeX Account',
      html: `<h3>Welcome to ServeX!</h3><p>Your verification code is: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP.'
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ==========================================
// 2. LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const user = doc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' });
    }

    const token = generateToken({ id: doc.id, ...user });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: doc.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ==========================================
// 3. VERIFY OTP
// ==========================================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const user = doc.data();

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    await userRef.update({
      isVerified: true,
      otp: null,
      otpExpires: null
    });

    const token = generateToken({ id: doc.id, ...user, isVerified: true });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: { id: doc.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// ==========================================
// 4. RESEND OTP
// ==========================================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    await userRef.update({ otp, otpExpires });

    await transporter.sendMail({
      from: `"ServeX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Verification Code',
      html: `<h3>New Code</h3><p>Your new code is: <b>${otp}</b></p>`
    });

    res.status(200).json({ success: true, message: 'OTP resent successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// 5. GOOGLE LOGIN
// ==========================================
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    let user;

    if (!doc.exists) {
      user = {
        name: name || 'Google User',
        email,
        role: 'client',
        isVerified: true,
        authProvider: 'google',
        photoUrl: picture,
        createdAt: new Date().toISOString()
      };
      await userRef.set(user);
    } else {
      user = doc.data();
    }

    const token = generateToken({ id: email, ...user });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: email,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl
      }
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};

// ==========================================
// 6. CREATE ADMIN
// ==========================================
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid Admin Secret' });
    }

    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    await userRef.set(newAdmin);

    res.status(201).json({ success: true, message: 'Admin account created successfully' });

  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};