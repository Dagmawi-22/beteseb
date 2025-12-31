import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Contact, Message, ChatConversation } from '../types/chat';
import { ChatService } from '../services/chatService';
import { EncryptionService } from '../services/encryptionService';
import { AuthService } from '../services/authService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatContextType {
  currentUser: User | null;
  updateCurrentUser: (user: Partial<User>) => void;
  contacts: Contact[];
  addContact: (contactEmail: string) => Promise<void>;
  messages: Message[];
  sendMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  conversations: ChatConversation[];
  getConversation: (contactId: string) => ChatConversation | undefined;
  markMessagesAsRead: (contactId: string) => void;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let CURRENT_USER_ID: string | null = null;

export const setCurrentUserId = (userId: string) => {
  CURRENT_USER_ID = userId;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      // Load user ID from storage if not already set
      if (!CURRENT_USER_ID) {
        const storedUserId = await AuthService.getCurrentUserId();
        if (storedUserId) {
          CURRENT_USER_ID = storedUserId;
        } else {
          // No user logged in
          setLoading(false);
          return;
        }
      }

      try {
        // Fetch current user
        const user = await ChatService.getCurrentUser(CURRENT_USER_ID);
        if (user) {
          setCurrentUser(user);

          const hasKeys = await EncryptionService.hasKeys();
          if (!hasKeys) {
            console.log('Initializing encryption keys for user...');
            const publicKey = await EncryptionService.initializeEncryption();

            await ChatService.updateUser(CURRENT_USER_ID, { publicKey });
            setCurrentUser((prev) => (prev ? { ...prev, publicKey } : null));
          } else if (!user.publicKey) {
            console.log('Uploading public key to database...');
            const privateKey = await EncryptionService.getPrivateKey();
            if (privateKey) {
               const newPublicKey = await EncryptionService.initializeEncryption();
              await ChatService.updateUser(CURRENT_USER_ID, { publicKey: newPublicKey });
              setCurrentUser((prev) => (prev ? { ...prev, publicKey: newPublicKey } : null));
            }
          }
        }

  const contactsList = await ChatService.getContacts(CURRENT_USER_ID);
        setContacts(contactsList);

        const conversationsData = await Promise.all(
          contactsList.map(async (contact) => {
            const msgs = await ChatService.getMessages(CURRENT_USER_ID!, contact.id);
            const unreadCount = msgs.filter(
              (msg) => msg.senderId === contact.id && !msg.isRead
            ).length;

            return {
              contactId: contact.id,
              messages: msgs,
              lastMessage: msgs[msgs.length - 1],
              unreadCount,
            };
          })
        );

        setConversations(conversationsData);

        const channel = ChatService.subscribeToMessages(CURRENT_USER_ID, (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);

          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.contactId === newMessage.senderId) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage,
                  unreadCount: conv.unreadCount + 1,
                };
              }
              return conv;
            })
          );
        });

        setMessageChannel(channel);
      } catch (error) {
        console.error('Error initializing chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      if (messageChannel) {
        ChatService.unsubscribeFromMessages(messageChannel);
      }
    };
  }, []);

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!currentUser) return;

    try {
      await ChatService.updateUser(currentUser.id, userData);
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const addContact = async (contactEmail: string) => {
    if (!currentUser) return;

    try {
      const contact = await ChatService.addContact(currentUser.id, contactEmail);
      if (contact) {
        setContacts((prev) => [...prev, contact]);
        setConversations((prev) => [
          ...prev,
          {
            contactId: contact.id,
            messages: [],
            unreadCount: 0,
          },
        ]);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const sendMessage = async (messageData: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentUser) return;

    try {
      const recipient = contacts.find((c) => c.id === messageData.receiverId);
      const recipientPublicKey = recipient?.publicKey;

      if (!recipientPublicKey) {
        console.warn('Recipient has no public key - message cannot be encrypted');
        return;
      }

      const newMessage = await ChatService.sendMessage(messageData, recipientPublicKey);
      if (newMessage) {
        setMessages((prev) => [...prev, newMessage]);

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.contactId === messageData.receiverId) {
              return {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessage: newMessage,
              };
            }
            return conv;
          })
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getConversation = (contactId: string): ChatConversation | undefined => {
    return conversations.find((conv) => conv.contactId === contactId);
  };

  const markMessagesAsRead = async (contactId: string) => {
    if (!currentUser) return;

    try {
      await ChatService.markMessagesAsRead(currentUser.id, contactId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === contactId && msg.receiverId === currentUser.id
            ? { ...msg, isRead: true }
            : msg
        )
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.contactId === contactId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        updateCurrentUser,
        contacts,
        addContact,
        messages,
        sendMessage,
        conversations,
        getConversation,
        markMessagesAsRead,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
