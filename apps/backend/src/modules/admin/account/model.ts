import { Typeboxs } from '@backend/db'
import { t } from 'elysia'

export const AccountModel = {
  getEnterpriseInfoBody: t.Object({
    cookie: t.String(),
  }),
  getEnterpriseInfoSuccess: t.Object({
    message: t.Literal('获取企业信息成功'),
    data: t.Array(
      t.Object({
        cid: t.Integer({ minimum: 0 }),
        orgInfo: t.Object({
          name: t.String(),
        }),
      }),
    ),
  }),
  getEnterpriseInfoFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),

  createAccountBody: t.Object({
    baidu_name: t.String(),
    cookie: t.String(),
    cid: t.Integer({ minimum: 0 }),
  }),
  createAccountSuccess: t.Object({
    message: t.Literal('创建异步任务成功'),
    data: t.Object({
      task_id: t.String(),
    }),
  }),
  createAccountFailed: t.Object({
    message: t.Literal('创建异步任务失败'),
    data: t.Null(),
  }),
  createAccountFailedConflict: t.Object({
    message: t.Literal('已存在相同 CID 的账号, 创建失败'),
    data: t.Null(),
  }),

  deleteAccountsBody: t.Object({
    ids: t.Array(t.Integer({ minimum: 0 })),
  }),
  deleteAccountsSuccess: t.Object({
    message: t.Literal('删除账号成功'),
    data: t.Null(),
  }),
  deleteAccountsFailedNotFound: t.Object({
    message: t.Literal('部分账号不存在, 删除失败'),
    data: t.Null(),
  }),
  deleteAccountsFailedReferenceError: t.Object({
    message: t.Literal('账号存在关联数据, 无法删除'),
    data: t.Null(),
  }),
  deleteAccountsFailedShouldNotDelete: t.Object({
    message: t.Literal('禁止删除ID为1的账号'),
    data: t.Null(),
  }),

  updateAccountsBody: t.Array(
    t.Object({
      id: t.Integer({ minimum: 0 }),
      baidu_name: t.Optional(t.String()),
      cookie: t.Optional(t.String()),
      // 禁止更新cid
      // cid: t.Optional(t.Integer({ minimum: 0 })),
      status: t.Optional(t.Boolean()),
      reason: t.Optional(t.String()),
    }),
  ),
  updateAccountsSuccess: t.Object({
    message: t.Literal('创建异步任务成功'),
    data: t.Object({
      task_id: t.Array(t.String()),
    }),
  }),
  updateAccountsFailed: t.Object({
    message: t.Literal('创建异步任务失败'),
    data: t.Null(),
  }),
  updateAccountsFailedNotFound: t.Object({
    message: t.Literal('部分账号不存在, 更新失败'),
    data: t.Null(),
  }),

  getAllAccountsQuery: t.Object({
    page: t.Optional(t.Integer({ minimum: 0 })),
    page_size: t.Optional(t.Integer({ minimum: 0 })),
    id: t.Optional(t.Integer({ minimum: 0 })),
    status: t.Optional(t.Boolean()),
    baidu_name: t.Optional(t.String()),
    uk: t.Optional(t.String()),
    org_name: t.Optional(t.String()),
    cid: t.Optional(t.Integer({ minimum: 0 })),
  }),
  getAllAccountsSuccess: t.Object({
    message: t.Literal('获取账号列表成功'),
    data: t.Object({
      total: t.Integer({ minimum: 0 }),
      page: t.Integer({ minimum: 0 }),
      page_size: t.Integer({ minimum: 0 }),
      data: t.Array(Typeboxs.Account),
    }),
  }),
}

export interface AccountModelType {
  getEnterpriseInfoBody: typeof AccountModel.getEnterpriseInfoBody.static
  createAccountBody: typeof AccountModel.createAccountBody.static
  deleteAccountsBody: typeof AccountModel.deleteAccountsBody.static
  updateAccountsBody: typeof AccountModel.updateAccountsBody.static
  getAllAccountsQuery: typeof AccountModel.getAllAccountsQuery.static
}
