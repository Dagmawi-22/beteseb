export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnboarded: boolean;
  publicKey?: string; 
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline: boolean;
  publicKey?: string; 
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatConversation {
  contactId: string;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}
