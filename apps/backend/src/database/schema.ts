import type { TypeboxTypes } from './typebox.ts'
import { sql } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

const timestamps = {
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const userTypeEnum = pgEnum('user_type', ['admin', 'user'])

export const User = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  password: text().notNull(),
  type: userTypeEnum().notNull().default('user'),
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
  table => [uniqueIndex('user_id_cid_unique_idx').on(table.user_id, table.cid)],
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
    use_count: integer().notNull().default(0),
    total_count: integer().notNull().default(0),
    tkbind_list: jsonb().notNull().$type<TypeboxTypes['ShareLinkTkbindListArray']>(),
    path: text().notNull(),
    ctime: timestamp().notNull(),
    ...timestamps,
  },
  table => [
    uniqueIndex('surl_shareid_unique_idx').on(table.surl, table.shareid),
    index('share_links_tkbind_list_trgm_idx').using('gin', sql`(${table.tkbind_list}::text) gin_trgm_ops`),
    index('share_links_tkbind_list_jsonb_idx').using('gin', table.tkbind_list),
  ],
)

export const Key = pgTable('keys', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => User.id),
  account_id: integer()
    .notNull()
    .references(() => Account.id),
  share_link_id: integer()
    .references(() => ShareLink.id),
  user_data: jsonb().$type<TypeboxTypes['KeyUserData']>(),
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
