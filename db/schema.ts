import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const progress = sqliteTable('progress', {
  userId: text('user_id').notNull(),
  key: text('record_key').notNull(),
  payload: text('payload').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.key] })]);
