import { User, Contact, Message, ChatConversation } from '../types/chat';

export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'You',
  email: 'you@example.com',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: 'Hey there! I am using Beteseb Chat App',
  isOnboarded: false, 
};

export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'Haile Gebrselassie',
    email: 'haile@example.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastSeen: new Date(Date.now() - 1000 * 60 * 5),
    isOnline: true,
  },
  {
    id: 'contact-2',
    name: 'Kenenisa Bekele',
    email: 'kenenisa@example.com',
    avatar: 'https://i.pravatar.cc/150?img=33',
    lastSeen: new Date(Date.now() - 1000 * 60 * 30),
    isOnline: false,
  },
  {
    id: 'contact-3',
    name: 'Tirunesh Dibaba',
    email: 'tirunesh@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isOnline: false,
  },
  {
    id: 'contact-4',
    name: 'Derartu Tulu',
    email: 'derartu@example.com',
    avatar: 'https://i.pravatar.cc/150?img=20',
    lastSeen: new Date(),
    isOnline: true,
  },
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'contact-1',
    receiverId: 'user-1',
    content: 'Hey! How are you doing?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), 
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    receiverId: 'contact-1',
    content: 'I am doing great! Thanks for asking.',
    timestamp: new Date(Date.now() - 1000 * 60 * 58),
    isRead: true,
  },
  {
    id: 'msg-3',
    senderId: 'contact-1',
    receiverId: 'user-1',
    content: 'Are we still on for the meeting tomorrow?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), 
    isRead: false,
  },
  {
    id: 'msg-4',
    senderId: 'contact-2',
    receiverId: 'user-1',
    content: 'Did you see the latest update?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), 
    isRead: false,
  },
  {
    id: 'msg-5',
    senderId: 'contact-4',
    receiverId: 'user-1',
    content: 'Let me know when you are free to chat',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), 
    isRead: true,
  },
];

export const mockConversations: ChatConversation[] = [
  {
    contactId: 'contact-1',
    messages: mockMessages.filter(
      (m) => m.senderId === 'contact-1' || m.receiverId === 'contact-1'
    ),
    lastMessage: mockMessages.find((m) => m.id === 'msg-3'),
    unreadCount: 1,
  },
  {
    contactId: 'contact-2',
    messages: mockMessages.filter(
      (m) => m.senderId === 'contact-2' || m.receiverId === 'contact-2'
    ),
    lastMessage: mockMessages.find((m) => m.id === 'msg-4'),
    unreadCount: 1,
  },
  {
    contactId: 'contact-4',
    messages: mockMessages.filter(
      (m) => m.senderId === 'contact-4' || m.receiverId === 'contact-4'
    ),
    lastMessage: mockMessages.find((m) => m.id === 'msg-5'),
    unreadCount: 0,
  },
];

export const mockAvatarOptions = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
];
