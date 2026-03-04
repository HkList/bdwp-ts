import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const UserModel = {
  createUserBody: t.Object({
    username: t.String({ minLength: 3, maxLength: 30 }),
    password: t.String({ minLength: 6, maxLength: 100 }),
  }),
  createUserSuccess: t.Object({
    message: t.Literal('创建用户成功'),
    data: t.Object({
      id: t.Integer({ minimum: 0 }),
    }),
  }),
  createUserFailedUsernameExists: t.Object({
    message: t.Literal('用户名已存在'),
    data: t.Null(),
  }),

  deleteUsersBody: t.Object({
    ids: t.Array(t.Integer({ minimum: 0 })),
  }),
  deleteUsersSuccess: t.Object({
    message: t.Literal('删除用户成功'),
    data: t.Null(),
  }),
  deleteUsersFailedNotFound: t.Object({
    message: t.Literal('部分用户不存在, 删除失败'),
    data: t.Null(),
  }),
  deleteUsersFailedReferenceError: t.Object({
    message: t.Literal('用户存在关联数据, 无法删除'),
    data: t.Null(),
  }),

  updateUsersBody: t.Array(
    t.Object({
      id: t.Integer({ minimum: 0 }),
      username: t.Optional(t.String({ minLength: 3, maxLength: 30 })),
      password: t.Optional(t.String({ minLength: 6, maxLength: 100 })),
    }),
  ),
  updateUsersSuccess: t.Object({
    message: t.Literal('更新用户信息成功'),
    data: t.Null(),
  }),
  updateUsersFailedNotFound: t.Object({
    message: t.Literal('部分用户不存在, 更新失败'),
    data: t.Null(),
  }),
  updateUsersFailedUsernameExists: t.Object({
    message: t.Literal('部分用户名已存在, 更新失败'),
    data: t.Null(),
  }),

  getAllUsersQuery: t.Object({
    page: t.Optional(t.Integer({ minimum: 0 })),
    page_size: t.Optional(t.Integer({ minimum: 0 })),
    id: t.Optional(t.Integer({ minimum: 0 })),
    username: t.Optional(t.String()),
  }),
  getAllUsersSuccess: t.Object({
    message: t.Literal('获取用户列表成功'),
    data: t.Object({
      total: t.Integer({ minimum: 0 }),
      page: t.Integer({ minimum: 0 }),
      page_size: t.Integer({ minimum: 0 }),
      data: t.Array(Typeboxs.User),
    }),
  }),
}

export interface UserModelType {
  createUserBody: typeof UserModel.createUserBody.static
  deleteUsersBody: typeof UserModel.deleteUsersBody.static
  updateUsersBody: typeof UserModel.updateUsersBody.static
  getAllUsersQuery: typeof UserModel.getAllUsersQuery.static
}
