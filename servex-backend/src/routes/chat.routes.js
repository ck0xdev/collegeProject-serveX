// src/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// All chat routes are protected
router.use(verifyToken);

router.post('/send', chatController.sendMessage);
router.get('/:projectId', chatController.getMessages);
router.put('/read', chatController.markAsRead);

module.exports = router;