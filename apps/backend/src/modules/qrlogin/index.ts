import { QrloginModel } from '@backend/modules/qrlogin/model.ts'
import { QrloginService } from '@backend/modules/qrlogin/service.ts'
import { KeyAuthPlugin } from '@backend/plugins/keyAuthPlugin.ts'
import { Elysia } from 'elysia'

export const QrloginModule = new Elysia({ prefix: '/qrlogin' })
  .use(KeyAuthPlugin())
  .get('/', async () => await QrloginService.getQrCode(), {
    response: {
      200: QrloginModel.getQrCodeSuccess,
      500: QrloginModel.getQrCodeFailed,
    },
    detail: {
      summary: '获取二维码',
      tags: ['二维码登录'],
    },
  })
  .post('/login', async ({ body }) => await QrloginService.loginByQrcode(body), {
    body: QrloginModel.loginByQrcodeBody,
    response: {
      200: QrloginModel.loginByQrcodeSuccess,
      202: QrloginModel.loginByQrcodeSuccessWaitingStatus,
      500: QrloginModel.loginByQrcodeFailed,
    },
    detail: {
      summary: '登陆',
      tags: ['二维码登录'],
    },
  })
