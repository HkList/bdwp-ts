import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const KeyModel = {
  createKeyBody: t.Object({
    account_id: t.Integer({ minimum: 0 }),
    keys: t.Array(t.String()),
    total_count: t.Integer({ minimum: 0 }),
    total_hours: t.Integer({ minimum: 0 }),
    disable_create_share_link: t.Optional(t.Boolean()),
  }),
  createKeySuccess: t.Object({
    message: t.Literal('创建异步任务成功'),
    data: t.Object({
      task_id: t.String(),
    }),
  }),
  createKeyFailedCreateJobFailed: t.Object({
    message: t.Literal('创建异步任务失败'),
    data: t.Null(),
  }),

  deleteKeysBody: t.Object({
    ids: t.Array(t.Integer({ minimum: 0 })),
  }),
  deleteKeysSuccess: t.Object({
    message: t.Literal('删除卡密成功'),
    data: t.Null(),
  }),
  deleteKeysFailedNotFound: t.Object({
    message: t.Literal('部分卡密不存在, 删除失败'),
    data: t.Null(),
  }),

  updateKeysBody: t.Array(
    t.Object({
      id: t.Integer({ minimum: 0 }),
      key: t.Optional(t.String()),
      used_count: t.Optional(t.Integer({ minimum: 0 })),
      total_count: t.Optional(t.Integer({ minimum: 0 })),
      expired_at: t.Optional(t.Date()),
      total_hours: t.Optional(t.Integer({ minimum: 0 })),
      status: t.Optional(t.Boolean()),
      reason: t.Optional(t.String()),
      share_link_id: t.Optional(t.Integer({ minimum: 0 })),
    }),
  ),
  updateKeysSuccess: t.Object({
    message: t.Literal('更新卡密信息成功'),
    data: t.Null(),
  }),
  updateKeysFailedNotFound: t.Object({
    message: t.Literal('部分卡密不存在, 更新失败'),
    data: t.Null(),
  }),
  updateKeysFailedShareLinkNotFound: t.Object({
    message: t.Literal('部分分享链接不存在, 更新失败'),
    data: t.Null(),
  }),

  getAllKeysQuery: t.Object({
    page: t.Optional(t.Integer({ minimum: 0 })),
    page_size: t.Optional(t.Integer({ minimum: 0 })),
    id: t.Optional(t.Integer({ minimum: 0 })),
    account_id: t.Optional(t.Integer({ minimum: 0 })),
    status: t.Optional(t.Boolean()),
    key: t.Optional(t.String()),
  }),
  getAllKeysSuccess: t.Object({
    message: t.Literal('获取卡密列表成功'),
    data: t.Object({
      total: t.Integer({ minimum: 0 }),
      page: t.Integer({ minimum: 0 }),
      page_size: t.Integer({ minimum: 0 }),
      data: t.Array(Typeboxs.Key),
    }),
  }),
}

export interface KeyModelType {
  createKeyBody: typeof KeyModel.createKeyBody.static
  deleteKeysBody: typeof KeyModel.deleteKeysBody.static
  updateKeysBody: typeof KeyModel.updateKeysBody.static
  getAllKeysQuery: typeof KeyModel.getAllKeysQuery.static
}
