import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environment'; // Ensure this points to your environment file

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  private apiUrl = 'http://localhost:5000'; // Match your backend port

  // Observables for components
  public newMessage$ = new Subject<any>();

  constructor() {
    this.socket = io(this.apiUrl, {
      withCredentials: true,
      autoConnect: false
    });
  }

  // Connect to socket
  connect(userId: string) {
    if (!this.socket.connected) {
      this.socket.connect();
      this.socket.emit('join', userId);
      
      // Listen for incoming messages
      this.socket.on('newMessage', (message) => {
        this.newMessage$.next(message);
      });
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Send a message
  sendMessage(payload: { senderId: string, receiverId: string, projectId: string, message: string, senderName: string }) {
    // Emit to socket for real-time
    this.socket.emit('sendMessage', payload);
    
    // You should also call your backend API to save it (if not handled purely by socket)
    // For this implementation, we assume the socket controller handles the saving.
    // Or simpler: Call the API endpoint we created:
    return fetch(`${this.apiUrl}/api/chat/send`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify(payload)
    }).then(res => res.json());
  }
}