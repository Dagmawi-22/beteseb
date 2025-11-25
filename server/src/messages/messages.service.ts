import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, or, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema';

@Injectable()
export class MessagesService {
  constructor(
    @Inject('DATABASE')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async sendMessage(senderId: number, recipientId: number, content: string) {
    // Verify both users exist
    const [sender] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, senderId));

    const [recipient] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, recipientId));

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const [message] = await this.db
      .insert(schema.messages)
      .values({
        senderId,
        recipientId,
        content,
      })
      .returning();

    return message;
  }

  async getConversation(userId1: number, userId2: number) {
    // Get all messages between two users
    return this.db
      .select()
      .from(schema.messages)
      .where(
        or(
          and(
            eq(schema.messages.senderId, userId1),
            eq(schema.messages.recipientId, userId2),
          ),
          and(
            eq(schema.messages.senderId, userId2),
            eq(schema.messages.recipientId, userId1),
          ),
        ),
      )
      .orderBy(desc(schema.messages.createdAt));
  }

  async getUserMessages(userId: number) {
    // Get all messages sent or received by a user
    return this.db
      .select()
      .from(schema.messages)
      .where(
        or(
          eq(schema.messages.senderId, userId),
          eq(schema.messages.recipientId, userId),
        ),
      )
      .orderBy(desc(schema.messages.createdAt));
  }
}
