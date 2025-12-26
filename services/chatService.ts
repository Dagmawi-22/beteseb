import { supabase } from '../lib/supabase';
import { User, Contact, Message } from '../types/chat';
import { RealtimeChannel } from '@supabase/supabase-js';
import { EncryptionService } from './encryptionService';

export class ChatService {
  // User operations
  static async getCurrentUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || undefined,
      bio: data.bio || undefined,
      isOnboarded: data.is_onboarded,
      publicKey: data.public_key || undefined,
    };
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || undefined,
      bio: data.bio || undefined,
      isOnboarded: data.is_onboarded,
      publicKey: data.public_key || undefined,
    };
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        avatar: updates.avatar,
        bio: updates.bio,
        is_onboarded: updates.isOnboarded,
        public_key: updates.publicKey,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        is_onboarded: user.isOnboarded,
        public_key: user.publicKey,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar || undefined,
      bio: data.bio || undefined,
      isOnboarded: data.is_onboarded,
      publicKey: data.public_key || undefined,
    };
  }

  // Contact operations
  static async getContacts(userId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        contact_user_id,
        users!contacts_contact_user_id_fkey (
          id,
          name,
          email,
          avatar,
          public_key
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }

    return data.map((contact: any) => ({
      id: contact.users.id,
      name: contact.users.name,
      email: contact.users.email,
      avatar: contact.users.avatar || undefined,
      isOnline: false, // Will be updated via presence
      publicKey: contact.users.public_key || undefined,
    }));
  }

  static async addContact(userId: string, contactEmail: string): Promise<Contact | null> {
    // First find the user by email
    const { data: contactUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', contactEmail)
      .single();

    if (findError || !contactUser) {
      console.error('Error finding contact user:', findError);
      return null;
    }

    // Then create the contact relationship
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        contact_user_id: contactUser.id,
      });

    if (insertError) {
      console.error('Error adding contact:', insertError);
      return null;
    }

    return {
      id: contactUser.id,
      name: contactUser.name,
      email: contactUser.email,
      avatar: contactUser.avatar || undefined,
      isOnline: false,
      publicKey: contactUser.public_key || undefined,
    };
  }

  // Message operations
  static async getMessages(userId: string, contactId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    // Decrypt messages
    const decryptedMessages = await Promise.all(
      data.map(async (msg) => {
        let decryptedContent = msg.content;

        // Only decrypt if the message is encrypted (has encrypted_key and iv)
        if (msg.encrypted_key && msg.iv && msg.receiver_id === userId) {
          try {
            decryptedContent = await EncryptionService.decryptMessage({
              encryptedContent: msg.content,
              encryptedKey: msg.encrypted_key,
              iv: msg.iv,
            });
          } catch (error) {
            console.error('Error decrypting message:', error);
            decryptedContent = '[Encrypted message - unable to decrypt]';
          }
        }

        return {
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          content: decryptedContent,
          timestamp: new Date(msg.created_at),
          isRead: msg.is_read,
        };
      })
    );

    return decryptedMessages;
  }

  static async sendMessage(
    message: Omit<Message, 'id' | 'timestamp'>,
    recipientPublicKey?: string
  ): Promise<Message | null> {
    // Encrypt the message if recipient has a public key
    let encryptedContent = message.content;
    let encryptedKey = '';
    let iv = '';

    if (recipientPublicKey) {
      try {
        const encrypted = await EncryptionService.encryptMessage(
          message.content,
          recipientPublicKey
        );
        encryptedContent = encrypted.encryptedContent;
        encryptedKey = encrypted.encryptedKey;
        iv = encrypted.iv;
      } catch (error) {
        console.error('Error encrypting message:', error);
        // Fall back to sending unencrypted if encryption fails
        return null;
      }
    } else {
      // No encryption - this shouldn't happen in production
      console.warn('Sending unencrypted message - recipient has no public key');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        content: encryptedContent,
        encrypted_key: encryptedKey,
        iv: iv,
        is_read: message.isRead,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Return the message with decrypted content (for local display)
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: message.content, // Return original unencrypted content
      timestamp: new Date(data.created_at),
      isRead: data.is_read,
    };
  }

  static async markMessagesAsRead(userId: string, contactId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('sender_id', contactId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Real-time subscriptions
  static subscribeToMessages(
    userId: string,
    onMessage: (message: Message) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const msg = payload.new as any;
          let decryptedContent = msg.content;

          // Decrypt the message if it's encrypted
          if (msg.encrypted_key && msg.iv) {
            try {
              decryptedContent = await EncryptionService.decryptMessage({
                encryptedContent: msg.content,
                encryptedKey: msg.encrypted_key,
                iv: msg.iv,
              });
            } catch (error) {
              console.error('Error decrypting real-time message:', error);
              decryptedContent = '[Encrypted message - unable to decrypt]';
            }
          }

          onMessage({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: decryptedContent,
            timestamp: new Date(msg.created_at),
            isRead: msg.is_read,
          });
        }
      )
      .subscribe();

    return channel;
  }

  static unsubscribeFromMessages(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  }
}
