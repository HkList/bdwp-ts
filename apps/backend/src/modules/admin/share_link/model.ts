import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const ShareLinkModel = {
  getAllShareLinksQuery: t.Object({
    page: t.Optional(t.Number()),
    page_size: t.Optional(t.Number()),
    id: t.Optional(t.Number()),
    account_id: t.Optional(t.Number()),
  }),
  getAllShareLinksSuccess: t.Object({
    message: t.Literal('获取分享链接列表成功'),
    data: t.Object({
      total: t.Number(),
      page: t.Number(),
      page_size: t.Number(),
      data: t.Array(Typeboxs.ShareLink),
    }),
  }),
}

export interface ShareLinkModelType {
  getAllShareLinksQuery: typeof ShareLinkModel.getAllShareLinksQuery.static
}
