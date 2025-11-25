import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE')
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async createUser(username: string, email: string) {
    try {
      const [user] = await this.db
        .insert(schema.users)
        .values({
          username,
          email,
        })
        .returning();

      return user;
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }

  async findUserById(id: number) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    return user;
  }

  async findUserByUsername(username: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));

    return user;
  }

  async getAllUsers() {
    return this.db.select().from(schema.users);
  }
}
