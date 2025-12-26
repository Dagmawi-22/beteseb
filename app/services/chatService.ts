import { supabase } from '../lib/supabase';
import { User, Contact, Message } from '../types/chat';
import { RealtimeChannel } from '@supabase/supabase-js';

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
          avatar
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

    return data.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      isRead: msg.is_read,
    }));
  }

  static async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        content: message.content,
        is_read: message.isRead,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
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
        (payload) => {
          const msg = payload.new as any;
          onMessage({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
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
