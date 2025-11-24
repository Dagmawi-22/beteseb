import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Example schema - you can modify this based on your needs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  content: text('content').notNull(),
  topic: varchar('topic', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
