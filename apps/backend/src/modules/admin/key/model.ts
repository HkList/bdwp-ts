import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const KeyModel = {
  createKeyBody: t.Object({
    account_id: t.Number(),
    keys: t.Array(t.String()),
    total_count: t.Number({ minimum: 1 }),
    total_hours: t.Number({ minimum: 1 }),
  }),
  createKeySuccess: t.Object({
    message: t.Literal('创建异步任务成功'),
    data: t.Object({
      task_id: t.String(),
    }),
  }),
  createKeyFailedAccountNotFound: t.Object({
    message: t.Literal('账号不存在'),
    data: t.Null(),
  }),
  createKeyFailedExceedRemainCount: t.Object({
    message: t.Literal('卡密数量超过账号剩余下载卷数量'),
    data: t.Null(),
  }),
  createKeyFailedCreateJobFailed: t.Object({
    message: t.Literal('创建异步任务失败'),
    data: t.Null(),
  }),

  deleteKeysBody: t.Object({
    ids: t.Array(t.Number()),
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
      id: t.Number(),
      key: t.Optional(t.String()),
      used_count: t.Optional(t.Number()),
      total_count: t.Optional(t.Number()),
      expired_at: t.Optional(t.Date()),
      total_hours: t.Optional(t.Number()),
      status: t.Optional(t.Boolean()),
      reason: t.Optional(t.String()),
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

  getAllKeysQuery: t.Object({
    page: t.Optional(t.Number()),
    page_size: t.Optional(t.Number()),
    id: t.Optional(t.Number()),
    account_id: t.Optional(t.Number()),
    status: t.Optional(t.Boolean()),
    key: t.Optional(t.String()),
  }),
  getAllKeysSuccess: t.Object({
    message: t.Literal('获取卡密列表成功'),
    data: t.Object({
      total: t.Number(),
      page: t.Number(),
      page_size: t.Number(),
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
