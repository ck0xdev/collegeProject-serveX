// src/models/chat.model.js
class ChatMessage {
  constructor({ senderId, receiverId, projectId, message, senderName }) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.projectId = projectId;
    this.message = message;
    this.senderName = senderName;
    this.read = false;
    this.createdAt = new Date().toISOString();
  }

  toJSON() {
    return {
      senderId: this.senderId,
      receiverId: this.receiverId,
      projectId: this.projectId,
      message: this.message,
      senderName: this.senderName,
      read: this.read,
      createdAt: this.createdAt
    };
  }
}

module.exports = ChatMessage;