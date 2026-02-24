import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const ShareLinkModel = {
  getAllShareLinksQuery: t.Object({
    page: t.Optional(t.Number()),
    page_size: t.Optional(t.Number()),
    id: t.Optional(t.Number()),
    account_id: t.Optional(t.Number()),
    surl: t.Optional(t.String()),
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

  deleteShareLinkBody: t.Object({
    ids: t.Array(t.Number()),
    force: t.Optional(t.Boolean()),
  }),
  deleteShareLinkSuccess: t.Object({
    message: t.Literal('删除分享链接成功'),
    data: t.Null(),
  }),
  deleteShareLinkFailedNotFound: t.Object({
    message: t.Literal('部分分享链接不存在, 删除失败'),
    data: t.Null(),
  }),
  deleteShareLinkFailedReferenced: t.Object({
    message: t.Literal('分享链接存在关联数据, 无法删除'),
    data: t.Null(),
  }),
}

export interface ShareLinkModelType {
  getAllShareLinksQuery: typeof ShareLinkModel.getAllShareLinksQuery.static
  deleteShareLinkBody: typeof ShareLinkModel.deleteShareLinkBody.static
}
