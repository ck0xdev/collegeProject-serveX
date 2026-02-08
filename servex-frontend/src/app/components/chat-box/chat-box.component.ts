import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { ChatMessage } from '../../models/chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-box',
  standalone: true, // ✅ THIS FIXES THE IMPORT ERROR
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() projectId!: string;
  @Input() currentUserId!: string;
  @Input() receiverId!: string;
  @Input() receiverName!: string;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  private messageSubscription!: Subscription;
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.connect(this.currentUserId);

    // Subscribe to new messages
    this.messageSubscription = this.chatService.newMessage$.subscribe((message: ChatMessage) => {
      if (message.projectId === this.projectId) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });

    // TODO: Load previous messages from API here
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const msgPayload = {
      senderId: this.currentUserId,
      receiverId: this.receiverId,
      projectId: this.projectId,
      message: this.newMessage,
      senderName: 'User' // Replace with actual name if available
    };

    // Optimistic update
    const tempMsg: ChatMessage = {
      ...msgPayload,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.messages.push(tempMsg);

    this.chatService.sendMessage(msgPayload).then(() => {
      // Success
    }).catch(err => console.error(err));

    this.newMessage = '';
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}