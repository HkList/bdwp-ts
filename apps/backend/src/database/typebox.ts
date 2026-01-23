import { t } from 'elysia'

export const UserTypeboxSchema = t.Object({
  id: t.Integer(),
  username: t.String(),
  password: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export type UserTypeboxSchemaType = typeof UserTypeboxSchema.static

export const AccountTypeboxSchema = t.Object({
  id: t.Integer(),
  userId: t.Integer(),
  baidu_name: t.String(),
  uk: t.String(),
  cookie: t.String(),
  bdstoken: t.String(),
  account_data: t.Any(),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export type AccountTypeboxSchemaType = typeof AccountTypeboxSchema.static

export const ShareLinkTypeboxSchema = t.Object({
  id: t.Integer(),
  user_id: t.Integer(),
  account_id: t.Integer(),
  surl: t.String(),
  pwd: t.String(),
  randsk: t.String(),
  shareid: t.String(),
  uk: t.String(),
  share_info: t.Any(),
  path: t.String(),
  ctime: t.Date(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export type ShareLinkTypeboxSchemaType = typeof ShareLinkTypeboxSchema.static

export const KeyTypeboxSchema = t.Object({
  id: t.Integer(),
  user_id: t.Integer(),
  account_id: t.Integer(),
  user_data: t.Optional(t.Any()),
  key: t.String(),
  used_count: t.Integer(),
  total_count: t.Integer(),
  expired_at: t.Date(),
  total_hours: t.Integer(),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export type KeyTypeboxSchemaType = typeof KeyTypeboxSchema.static

export const Typeboxs = {
  UserTypeboxSchema,
  AccountTypeboxSchema,
  ShareLinkTypeboxSchema,
  KeyTypeboxSchema,
} as const

export interface TypeboxTypes {
  UserTypeboxSchemaType: UserTypeboxSchemaType
  AccountTypeboxSchemaType: AccountTypeboxSchemaType
  ShareLinkTypeboxSchemaType: ShareLinkTypeboxSchemaType
  KeyTypeboxSchemaType: KeyTypeboxSchemaType
}
