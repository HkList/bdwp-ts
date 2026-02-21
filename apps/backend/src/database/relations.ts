import { Schemas } from '@backend/database/schema.ts'
import { defineRelations } from 'drizzle-orm'

export const Relations = defineRelations(Schemas, r => ({
  Account: {
    User: r.one.User({
      from: r.Account.user_id,
      to: r.User.id,
    }),
  },
  ShareLink: {
    User: r.one.User({
      from: r.ShareLink.user_id,
      to: r.User.id,
    }),
    Account: r.one.Account({
      from: r.ShareLink.account_id,
      to: r.Account.id,
    }),
  },
  Key: {
    User: r.one.User({
      from: r.Key.user_id,
      to: r.User.id,
    }),
    Account: r.one.Account({
      from: r.Key.account_id,
      to: r.Account.id,
    }),
  },
}))
