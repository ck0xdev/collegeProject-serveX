// src/config/firebase.config.js
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };