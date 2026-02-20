import { UserModel } from '@backend/modules/admin/user/model.ts'
import { UserService } from '@backend/modules/admin/user/service.ts'
import { Elysia } from 'elysia'

export const UserModule = new Elysia({ prefix: '/users' })
  .post('/', async ({ body }) => await UserService.createUser(body), {
    body: UserModel.createUserBody,
    response: {
      201: UserModel.createUserSuccess,
      409: UserModel.createUserFailedUsernameExists,
    },
    detail: {
      summary: '创建用户',
      tags: ['用户管理'],
    },
  })
  .delete('/', async ({ body }) => await UserService.deleteUsers(body), {
    body: UserModel.deleteUsersBody,
    response: {
      200: UserModel.deleteUsersSuccess,
      404: UserModel.deleteUsersFailedNotFound,
      500: UserModel.deleteUsersFailedReferenceError,
    },
    detail: {
      summary: '删除用户',
      tags: ['用户管理'],
    },
  })
  .patch('/', async ({ body }) => await UserService.updateUsers(body), {
    body: UserModel.updateUsersBody,
    response: {
      200: UserModel.updateUsersSuccess,
      404: UserModel.updateUsersFailedNotFound,
      409: UserModel.updateUsersFailedUsernameExists,
    },
    detail: {
      summary: '更新用户信息',
      tags: ['用户管理'],
    },
  })
  .get('/', async ({ query }) => await UserService.getAllUsers(query), {
    query: UserModel.getAllUsersQuery,
    response: {
      200: UserModel.getAllUsersSuccess,
    },
    detail: {
      summary: '获取所有用户',
      tags: ['用户管理'],
    },
  })
