import { t } from 'elysia'

const UserTypeTypeSchema = t.Enum({
  admin: 'admin',
  user: 'user',
})

const UserTypeboxSchema = t.Object({
  id: t.Integer({ minimum: 0 }),
  username: t.String(),
  password: t.String(),
  type: UserTypeTypeSchema,
  created_at: t.Date(),
  updated_at: t.Date(),
})

const AccountTypeboxSchema = t.Object({
  id: t.Integer({ minimum: 0 }),
  user_id: t.Integer({ minimum: 0 }),
  baidu_name: t.String(),
  uk: t.String(),
  cookie: t.String(),
  bdstoken: t.String(),
  org_name: t.String(),
  cid: t.String(),
  ticket_remain_count: t.Integer({ minimum: 0 }),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

const ShareLinkTkbindListSingleTypeboxSchema = t.Object({
  avatar: t.String(),
  channel: t.Integer({ minimum: 0 }),
  ctime: t.Integer({ minimum: 0 }),
  uk: t.Integer({ minimum: 0 }),
  username: t.String(),
})

const ShareLinkTkbindListArrayTypeboxSchema = t.Array(ShareLinkTkbindListSingleTypeboxSchema)

const ShareLinkTypeboxSchema = t.Object({
  id: t.Integer({ minimum: 0 }),
  user_id: t.Integer({ minimum: 0 }),
  account_id: t.Integer({ minimum: 0 }),
  surl: t.String(),
  pwd: t.String(),
  randsk: t.String(),
  shareid: t.String(),
  uk: t.String(),
  use_count: t.Integer({ minimum: 0 }),
  total_count: t.Integer({ minimum: 0 }),
  tkbind_list: ShareLinkTkbindListArrayTypeboxSchema,
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
  id: t.Integer({ minimum: 0 }),
  user_id: t.Integer({ minimum: 0 }),
  account_id: t.Integer({ minimum: 0 }),
  share_link_id: t.Nullable(t.Integer({ minimum: 0 })),
  user_data: t.Nullable(KeyUserDataTypeboxSchema),
  key: t.String(),
  used_count: t.Integer({ minimum: 0 }),
  total_count: t.Integer({ minimum: 0 }),
  expired_at: t.Nullable(t.Date()),
  total_hours: t.Integer({ minimum: 0 }),
  status: t.Boolean(),
  reason: t.String(),
  created_at: t.Date(),
  updated_at: t.Date(),
})

export const Typeboxs = {
  User: UserTypeboxSchema,
  UserType: UserTypeTypeSchema,
  Account: AccountTypeboxSchema,
  ShareLinkTkbindListSingle: ShareLinkTkbindListSingleTypeboxSchema,
  ShareLinkTkbindListArray: ShareLinkTkbindListArrayTypeboxSchema,
  ShareLink: ShareLinkTypeboxSchema,
  KeyUserData: KeyUserDataTypeboxSchema,
  Key: KeyTypeboxSchema,
} as const

export interface TypeboxTypes {
  User: typeof UserTypeboxSchema.static
  UserType: typeof UserTypeTypeSchema.static
  Account: typeof AccountTypeboxSchema.static
  ShareLinkTkbindListSingle: typeof ShareLinkTkbindListSingleTypeboxSchema.static
  ShareLinkTkbindListArray: typeof ShareLinkTkbindListArrayTypeboxSchema.static
  ShareLink: typeof ShareLinkTypeboxSchema.static
  KeyUserData: typeof KeyUserDataTypeboxSchema.static
  Key: typeof KeyTypeboxSchema.static
}
