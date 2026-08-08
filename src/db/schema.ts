import { pgTable, serial, varchar, timestamp, boolean, text, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("PENGGUNA"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  pairedNumber: varchar("paired_number", { length: 32 }),
  pairedAt: timestamp("paired_at"),
});

export const messageLogs = pgTable("message_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetNumber: varchar("target_number", { length: 32 }).notNull(),
  bugTypes: jsonb("bug_types").$type<string[]>().notNull(),
  senderMode: varchar("sender_mode", { length: 20 }).notNull(),
  targetMode: varchar("target_mode", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("BERHASIL"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 64 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 127 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull().default("Bot Key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
  isActive: boolean("is_active").default(true).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MessageLog = typeof messageLogs.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
