import { SmsLoginModel } from '@backend/modules/user/smslogin/model.ts'
import { SmsLoginService } from '@backend/modules/user/smslogin/service.ts'
import { KeyAuthPlugin } from '@backend/plugins/keyAuthPlugin.ts'
import { Elysia } from 'elysia'

export const SmsLoginModule = new Elysia({ prefix: '/smslogin' })
  .use(KeyAuthPlugin())
  .post('/send', async ({ body }) => await SmsLoginService.sendSms(body), {
    query: SmsLoginModel.sendSmsQuery,
    body: SmsLoginModel.sendSmsBody,
    response: {
      200: SmsLoginModel.sendSmsSuccess,
      403: SmsLoginModel.sendSmsFailed,
      500: SmsLoginModel.sendSmsFailed,
    },
    detail: {
      summary: '发送短信验证码',
      tags: ['短信登陆'],
    },
  })
  .post('/login', async ({ body }) => await SmsLoginService.loginBySms(body), {
    query: SmsLoginModel.loginBySmsQuery,
    body: SmsLoginModel.loginBySmsBody,
    response: {
      200: SmsLoginModel.loginBySmsSuccess,
      403: SmsLoginModel.loginBySmsFailed,
      500: SmsLoginModel.loginBySmsFailed,
    },
    detail: {
      summary: '登陆',
      tags: ['短信登陆'],
    },
  })
