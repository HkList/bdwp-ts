import { UserModel } from '@backend/modules/admin/user/model.ts'
import { UserService } from '@backend/modules/admin/user/service.ts'
import { AuthPlugin } from '@backend/plugins/authPlugin.ts'
import { Elysia } from 'elysia'

export const UserModule = new Elysia({ prefix: '/users' })
  .use(AuthPlugin())
  .post('/', async ({ body }) => await UserService.createUser(body), {
    body: UserModel.createUserBody,
    response: {
      200: UserModel.createUserSuccess,
      409: UserModel.createUserFailedUsernameExists,
    },
    detail: {
      summary: '创建新用户',
      tags: ['用户管理'],
    },
  })
  .delete('/:id', async ({ params }) => await UserService.deleteUserById(Number(params.id)), {
    response: {
      200: UserModel.deleteUserByIdSuccess,
      404: UserModel.deleteUserByIdFailedNotFound,
    },
    detail: {
      summary: '删除用户',
      tags: ['用户管理'],
    },
  })
  .delete('/', async ({ body }) => await UserService.deleteUsers(body), {
    body: UserModel.deleteUsersBody,
    response: {
      200: UserModel.deleteUsersSuccess,
      404: UserModel.deleteUsersFailedNotFound,
    },
    detail: {
      summary: '批量删除用户',
      tags: ['用户管理'],
    },
  })
  .patch(
    '/:id',
    async ({ params, body }) => await UserService.updateUserById(Number(params.id), body),
    {
      body: UserModel.updateUserByIdBody,
      response: {
        200: UserModel.updateUserByIdSuccess,
        404: UserModel.updateUserByIdFailedNotFound,
        409: UserModel.updateUserByIdFailedUsernameExists,
      },
      detail: {
        summary: '更新用户信息',
        tags: ['用户管理'],
      },
    },
  )
  .patch('/', async ({ body }) => await UserService.updateUsers(body), {
    body: UserModel.updateUsersBody,
    response: {
      200: UserModel.updateUsersSuccess,
      404: UserModel.updateUsersFailedNotFound,
      409: UserModel.updateUsersFailedUsernameExists,
    },
    detail: {
      summary: '批量更新用户信息',
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
  .get('/:id', async ({ params }) => await UserService.getUserById(Number(params.id)), {
    response: {
      200: UserModel.getUserByIdSuccess,
      404: UserModel.getUserByIdFailedNotFound,
    },
    detail: {
      summary: '通过ID获取用户',
      tags: ['用户管理'],
    },
  })
