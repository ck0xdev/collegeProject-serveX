// src/app/components/chat-box/chat-box.component.ts
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models/chat.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  @Input() projectId!: string;
  @Input() projectName!: string;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser: User | null = null;
  loading = true;
  isTyping = false;
  typingUser = '';
  isOpen = false;
  unreadCount = 0;

  private typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Connect to chat server
    this.chatService.connect();
    
    // Join project chat room
    this.chatService.joinProject(this.projectId);
    
    // Load chat history
    this.loadChatHistory();
    
    // Subscribe to new messages
    this.chatService.newMessage$.subscribe(message => {
      if (message && message.projectId === this.projectId) {
        this.messages.push(message);
        this.scrollToBottom();
        
        // Update unread count if chat is closed
        if (!this.isOpen && message.senderId !== this.currentUser?.email) {
          this.unreadCount++;
        }
      }
    });
    
    // Subscribe to typing indicator
    this.chatService.typing$.subscribe(data => {
      if (data) {
        this.isTyping = data.isTyping;
        this.typingUser = data.userName;
        
        // Auto-hide typing after 3 seconds
        if (this.isTyping) {
          setTimeout(() => {
            this.isTyping = false;
          }, 3000);
        }
      }
    });
  }

  loadChatHistory() {
    this.loading = true;
    this.chatService.getChatHistory(this.projectId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.messages = response.data;
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load chat history:', error);
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    
    this.chatService.sendMessage(this.projectId, this.newMessage.trim());
    this.newMessage = '';
    
    // Stop typing indicator
    this.chatService.sendTyping(this.projectId, false);
  }

  onTyping() {
    // Send typing indicator
    this.chatService.sendTyping(this.projectId, true);
    
    // Clear previous timeout
    clearTimeout(this.typingTimeout);
    
    // Stop typing after 2 seconds of inactivity
    this.typingTimeout = setTimeout(() => {
      this.chatService.sendTyping(this.projectId, false);
    }, 2000);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.unreadCount = 0;
      setTimeout(() => this.scrollToBottom(), 100);
      
      // Mark messages as read
      this.chatService.markAsRead(this.projectId).subscribe();
    }
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.email;
  }

  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(timestamp: any): string {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  shouldShowDate(index: number): boolean {
    if (index === 0) return true;
    
    const current = this.messages[index].timestamp;
    const previous = this.messages[index - 1].timestamp;
    
    const currentDate = current.toDate ? current.toDate() : new Date(current);
    const previousDate = previous.toDate ? previous.toDate() : new Date(previous);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  ngOnDestroy() {
    this.chatService.disconnect();
  }
}