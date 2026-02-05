// src/models/project.model.js
const { db } = require('../config/firebase.config');
const admin = require('firebase-admin');

class Project {
  constructor(data) {
  this.name = data.name;
  this.description = data.description;
  this.service = data.service;
  this.budget = data.budget;
  this.status = data.status || 'pending';
  this.clientEmail = data.clientEmail;
  this.clientName = data.clientName || 'Client';
  this.amount = data.amount || '0';
  this.createdAt = data.createdAt || admin.firestore.Timestamp.now();
  this.updatedAt = data.updatedAt || admin.firestore.Timestamp.now();
  this.files = data.files || [];
  this.progress = data.progress || 0;
}

  // Create new project
  // Create new project
async save() {
  const projectRef = db.collection('projects').doc();
  const now = admin.firestore.Timestamp.now(); // Use Firestore Timestamp
  
  await projectRef.set({
    id: projectRef.id,
    name: this.name,
    description: this.description,
    service: this.service,
    budget: this.budget,
    status: this.status,
    clientEmail: this.clientEmail,
    clientName: this.clientName || 'Client', // Add client name
    amount: this.amount,
    createdAt: now, // Use Firestore Timestamp
    updatedAt: now, // Use Firestore Timestamp
    files: this.files || [],
    progress: this.progress || 0
  });
  return { id: projectRef.id, ...this };
}

  // Get all projects for a user
  static async findByEmail(email) {
  const snapshot = await db.collection('projects')
    .where('clientEmail', '==', email)
    .get();
  
  if (snapshot.empty) {
    return [];
  }

  // Sort manually in JavaScript instead
  const projects = snapshot.docs.map(doc => doc.data());
  return projects.sort((a, b) => {
    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
    return dateB - dateA; // Newest first
  });
}

  // Get single project
  static async findById(id) {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data();
  }

  // Update project
  static async update(id, data) {
    const projectRef = db.collection('projects').doc(id);
    data.updatedAt = new Date();
    await projectRef.update(data);
    return true;
  }

  // Delete project
  static async delete(id) {
    await db.collection('projects').doc(id).delete();
    return true;
  }
}

module.exports = Project;