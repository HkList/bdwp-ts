import { Typeboxs } from '@backend/db'
import { t } from 'elysia'

export const AuthModel = {
  signInBody: t.Object({
    username: t.String(),
    password: t.String(),
    remember_me: t.Boolean(),
  }),
  signInSuccess: t.Object({
    message: t.Literal('登录成功'),
    data: t.Object({
      type: Typeboxs.UserType,
      token: t.String(),
    }),
  }),
  signInFailedInvalidPassword: t.Object({
    message: t.Literal('密码错误'),
    data: t.Null(),
  }),
  signInFailedAccountNotFound: t.Object({
    message: t.Literal('账号不存在'),
    data: t.Null(),
  }),

  signOutSuccess: t.Object({
    message: t.Literal('登出成功'),
    data: t.Null(),
  }),
}

export interface AuthModelType {
  signInBody: typeof AuthModel.signInBody.static
}
