// src/controllers/chat.controller.js
const admin = require('firebase-admin');
const db = admin.firestore();
const ChatMessage = require('../models/chat.model');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, projectId, message, senderName } = req.body;
    const senderId = req.user.uid; // From auth middleware

    const chatMessage = new ChatMessage({
      senderId,
      receiverId,
      projectId,
      message,
      senderName
    });

    // 1. Save to Firestore
    const docRef = await db.collection('chats').add(chatMessage.toJSON());
    const savedMessage = { id: docRef.id, ...chatMessage.toJSON() };

    // 2. Emit Real-time Event via Socket.io
    const io = req.app.get('io');
    
    // Emit to receiver's private room
    io.to(receiverId).emit('newMessage', savedMessage);
    
    // Also emit to sender (for instant UI update without refetching)
    io.to(senderId).emit('messageSent', savedMessage);

    res.status(201).json({
      success: true,
      data: savedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Get message history for a project
exports.getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const snapshot = await db.collection('chats')
      .where('projectId', '==', projectId)
      .orderBy('createdAt', 'asc')
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;

    const batch = db.batch();
    
    messageIds.forEach(id => {
      const docRef = db.collection('chats').doc(id);
      batch.update(docRef, { read: true });
    });

    await batch.commit();

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};