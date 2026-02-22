import { t } from 'elysia'

const UserTypeTypeSchema = t.Enum({
  admin: 'admin',
  user: 'user',
})

const UserTypeboxSchema = t.Object({
  id: t.Integer(),
  username: t.String(),
  password: t.String(),
  type: UserTypeTypeSchema,
  created_at: t.Date(),
  updated_at: t.Date(),
})

const AccountTypeboxSchema = t.Object({
  id: t.Integer(),
  user_id: t.Integer(),
  baidu_name: t.String(),
  uk: t.String(),
  cookie: t.String(),
  bdstoken: t.String(),
  org_name: t.String(),
  cid: t.String(),
  ticket_remain_count: t.Integer(),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

const ShareLinkShareInfoTkbindListTypeboxSchema = t.Object({
  avatar: t.String(),
  channel: t.Integer(),
  ctime: t.Integer(),
  uk: t.Integer(),
  username: t.String(),
})

const ShareLinkShareInfoTypeboxSchema = t.Object({
  tkbind_list: t.Array(ShareLinkShareInfoTkbindListTypeboxSchema),
  use_count: t.Integer(),
  total_count: t.Integer(),
  shareid: t.String(),
})

const ShareLinkTypeboxSchema = t.Object({
  id: t.Integer(),
  user_id: t.Integer(),
  account_id: t.Integer(),
  surl: t.String(),
  pwd: t.String(),
  randsk: t.String(),
  shareid: t.String(),
  uk: t.String(),
  share_info: t.Union([
    t.Null(),
    ShareLinkShareInfoTypeboxSchema,
  ]),
  path: t.String(),
  ctime: t.Date(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

const KeyUserDataTypeboxSchema = t.Object({
  username: t.String(),
  baidu_name: t.String(),
  uk: t.String(),
})

const KeyTypeboxSchema = t.Object({
  id: t.Integer(),
  user_id: t.Integer(),
  account_id: t.Integer(),
  user_data: t.Union([
    t.Null(),
    KeyUserDataTypeboxSchema,
  ]),
  key: t.String(),
  used_count: t.Integer(),
  total_count: t.Integer(),
  expired_at: t.Nullable(t.Date()),
  total_hours: t.Integer(),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export const Typeboxs = {
  User: UserTypeboxSchema,
  UserType: UserTypeTypeSchema,
  Account: AccountTypeboxSchema,
  ShareLinkShareInfoTkbindList: ShareLinkShareInfoTkbindListTypeboxSchema,
  ShareLinkShareInfo: ShareLinkShareInfoTypeboxSchema,
  ShareLink: ShareLinkTypeboxSchema,
  KeyUserData: KeyUserDataTypeboxSchema,
  Key: KeyTypeboxSchema,
} as const

export interface TypeboxTypes {
  User: typeof UserTypeboxSchema.static
  UserType: typeof UserTypeTypeSchema.static
  Account: typeof AccountTypeboxSchema.static
  ShareLinkShareInfoTkbindList: typeof ShareLinkShareInfoTkbindListTypeboxSchema.static
  ShareLinkShareInfo: typeof ShareLinkShareInfoTypeboxSchema.static
  ShareLink: typeof ShareLinkTypeboxSchema.static
  KeyUserData: typeof KeyUserDataTypeboxSchema.static
  Key: typeof KeyTypeboxSchema.static
}
