export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  message: string;
  senderName: string;
  read: boolean;
  createdAt: string;
}