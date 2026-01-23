import { AuthModel } from '@backend/modules/auth/model.ts'
import { AuthService } from '@backend/modules/auth/service.ts'
import { AuthPlugin } from '@backend/plugins/authPlugin.ts'
import { Elysia } from 'elysia'

export const AuthModule = new Elysia({ prefix: '/auth' })
  .post('/sign_in', async ({ body }) => await AuthService.signIn(body), {
    body: AuthModel.signInBody,
    response: {
      200: AuthModel.signInSuccess,
      401: AuthModel.signInFailedInvalidPassword,
      404: AuthModel.signInFailedAccountNotFound,
    },
    detail: {
      summary: '登录',
      tags: ['授权管理'],
    },
  })
  .group('', (app) =>
    app.use(AuthPlugin()).delete('/sign_out', async ({ user }) => await AuthService.signOut(user), {
      response: {
        200: AuthModel.signOutSuccess,
      },
      detail: {
        summary: '注销',
        tags: ['授权管理'],
      },
    }),
  )
