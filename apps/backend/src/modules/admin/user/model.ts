import { Typeboxs } from '@backend/database/typebox.ts'
import { t } from 'elysia'

export const UserModel = {
  createUserBody: t.Object({
    username: t.String({ minLength: 3, maxLength: 30 }),
    password: t.String({ minLength: 6, maxLength: 100 }),
    confirm_password: t.String({ minLength: 6, maxLength: 100 }),
  }),
  createUserSuccess: t.Object({
    message: t.Literal('创建用户成功'),
    data: t.Object({
      id: t.Number(),
    }),
  }),
  createUserFailedWrongConfirmPassword: t.Object({
    message: t.Literal('两次输入的密码不一致'),
    data: t.Null(),
  }),
  createUserFailedUsernameExists: t.Object({
    message: t.Literal('用户名已存在'),
    data: t.Null(),
  }),

  deleteUserByIdSuccess: t.Object({
    message: t.Literal('删除用户成功'),
    data: t.Null(),
  }),
  deleteUserByIdFailedNotFound: t.Object({
    message: t.Literal('用户不存在'),
    data: t.Null(),
  }),

  deleteUsersBody: t.Object({
    ids: t.Array(t.Number()),
  }),
  deleteUsersSuccess: t.Object({
    message: t.Literal('删除用户成功'),
    data: t.Null(),
  }),
  deleteUsersFailedNotFound: t.Object({
    message: t.Literal('部分用户不存在, 删除失败'),
    data: t.Null(),
  }),

  updateUserByIdBody: t.Partial(
    t.Object({
      username: t.String({ minLength: 3, maxLength: 30 }),
      password: t.String({ minLength: 6, maxLength: 100 }),
    }),
  ),
  updateUserByIdSuccess: t.Object({
    message: t.Literal('更新用户信息成功'),
    data: t.Null(),
  }),
  updateUserByIdFailedNotFound: t.Object({
    message: t.Literal('用户不存在'),
    data: t.Null(),
  }),
  updateUserByIdFailedUsernameExists: t.Object({
    message: t.Literal('用户名已存在'),
    data: t.Null(),
  }),

  updateUsersBody: t.Array(
    t.Object({
      id: t.Number(),
      username: t.Optional(t.String({ minLength: 3, maxLength: 30 })),
      password: t.Optional(t.String({ minLength: 6, maxLength: 100 })),
    }),
  ),
  updateUsersSuccess: t.Object({
    message: t.Literal('批量更新用户信息成功'),
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
    page: t.Optional(t.Number()),
    page_size: t.Optional(t.Number()),
    id: t.Optional(t.Number()),
  }),
  getAllUsersSuccess: t.Object({
    message: t.Literal('获取用户列表成功'),
    data: t.Object({
      total: t.Number(),
      page: t.Number(),
      page_size: t.Number(),
      data: t.Array(Typeboxs.UserTypeboxSchema),
    }),
  }),

  getUserByIdSuccess: t.Object({
    message: t.Literal('获取用户信息成功'),
    data: Typeboxs.UserTypeboxSchema,
  }),
  getUserByIdFailedNotFound: t.Object({
    message: t.Literal('用户不存在'),
    data: t.Null(),
  }),
}

export interface UserModelType {
  createUserBody: typeof UserModel.createUserBody.static
  deleteUsersBody: typeof UserModel.deleteUsersBody.static
  updateUserByIdBody: typeof UserModel.updateUserByIdBody.static
  updateUsersBody: typeof UserModel.updateUsersBody.static
  getAllUsersQuery: typeof UserModel.getAllUsersQuery.static
}
