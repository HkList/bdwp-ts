import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

const timestamps = {
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const User = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  password: text().notNull(),
  ...timestamps,
})

export const Account = pgTable(
  'accounts',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer()
      .notNull()
      .references(() => User.id),
    baidu_name: text().notNull(),
    uk: text().notNull(),
    cookie: text().notNull(),
    bdstoken: text().notNull(),
    org_name: text().notNull(),
    cid: text().notNull(),
    ticket_remain_count: integer().notNull(),
    status: boolean().notNull().default(true),
    reason: text().notNull().default(''),
    ...timestamps,
  },
  (table) => [uniqueIndex('user_id_cid_unique_idx').on(table.user_id, table.cid)],
)

export const ShareLink = pgTable(
  'share_links',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer()
      .notNull()
      .references(() => User.id),
    account_id: integer()
      .notNull()
      .references(() => Account.id),
    surl: text().notNull().unique(),
    pwd: text().notNull(),
    randsk: text().notNull(),
    shareid: text().notNull().unique(),
    uk: text().notNull(),
    share_info: jsonb().notNull(),
    path: text().notNull(),
    ctime: timestamp().notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex('surl_shareid_unique_idx').on(table.surl, table.shareid)],
)

export const Key = pgTable('keys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => User.id),
  account_id: integer()
    .notNull()
    .references(() => Account.id),
  user_data: jsonb(),
  key: text().notNull().unique(),
  used_count: integer().notNull().default(0),
  total_count: integer().notNull(),
  expired_at: timestamp(),
  total_hours: integer().notNull(),
  status: boolean().notNull().default(true),
  reason: text().notNull().default(''),
  ...timestamps,
})

export const Schemas = {
  User,
  Account,
  ShareLink,
  Key,
} as const
