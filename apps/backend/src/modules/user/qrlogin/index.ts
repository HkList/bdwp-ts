import { QrloginModel } from '@backend/modules/user/qrlogin/model.ts'
import { QrloginService } from '@backend/modules/user/qrlogin/service.ts'
import { KeyAuthPlugin } from '@backend/plugins/keyAuthPlugin.ts'
import { Elysia } from 'elysia'

export const QrloginModule = new Elysia({ prefix: '/qrlogin' })
  .use(KeyAuthPlugin())
  .get('/', async () => await QrloginService.getQrCode(), {
    query: QrloginModel.getQrCodeQuery,
    response: {
      200: QrloginModel.getQrCodeSuccess,
      500: QrloginModel.getQrCodeFailed,
    },
    detail: {
      summary: '获取二维码',
      tags: ['二维码登录'],
    },
  })
  .post('/login', async ({ body }) => await QrloginService.loginByQrCode(body), {
    query: QrloginModel.loginByQrCodeQuery,
    body: QrloginModel.loginByQrCodeBody,
    response: {
      200: QrloginModel.loginByQrCodeSuccess,
      202: QrloginModel.loginByQrCodeSuccessWaitingStatus,
      500: QrloginModel.loginByQrCodeFailed,
    },
    detail: {
      summary: '登陆',
      tags: ['二维码登录'],
    },
  })
