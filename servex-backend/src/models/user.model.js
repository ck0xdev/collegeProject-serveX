// src/models/user.model.js
const { db } = require('../config/firebase.config');

class User {
  constructor(data) {
    this.email = data.email;
    this.name = data.name;
    this.password = data.password;
    this.isVerified = data.isVerified || false;
    this.otp = data.otp || null;
    this.otpExpiry = data.otpExpiry || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.role = data.role || 'client'; // client or admin
  }

  // Save user to Firestore
  async save() {
    const userRef = db.collection('users').doc(this.email);
    await userRef.set({
      email: this.email,
      name: this.name,
      password: this.password,
      isVerified: this.isVerified,
      otp: this.otp,
      otpExpiry: this.otpExpiry,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      role: this.role
    });
    return this;
  }

  // Find user by email
  static async findByEmail(email) {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data();
  }

  // Update user
  static async update(email, data) {
    const userRef = db.collection('users').doc(email);
    data.updatedAt = new Date();
    await userRef.update(data);
    return true;
  }

  // Delete user
  static async delete(email) {
    const userRef = db.collection('users').doc(email);
    await userRef.delete();
    return true;
  }
}

module.exports = User;