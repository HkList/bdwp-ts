import { QrloginModel } from '@backend/modules/qrlogin/model.ts'
import { QrloginService } from '@backend/modules/qrlogin/service.ts'
import { Elysia, t } from 'elysia'

export const QrloginModule = new Elysia({ prefix: '/qrlogin' })
  .get('/get_qr_code', async () => await QrloginService.getQrCode(), {
    response: {
      200: QrloginModel.getQrCodeSuccess,
      500: t.Union([QrloginModel.getQrCodeFailed, QrloginModel.getQroCodeFailedApiInvalid]),
    },
    detail: {
      summary: '获取二维码',
      tags: ['二维码登录'],
    },
  })
  .get('/check_qr_code_status', async ({ query }) => await QrloginService.loginByQrcode(query), {
    query: QrloginModel.loginByQrcodeQuery,
    response: {
      200: t.Union([QrloginModel.loginByQrcodeSuccess]),
      202: QrloginModel.loginByQrcodeSuccessWaitingStatus,
      500: t.Union([
        QrloginModel.loginByQrcodeFailed,
        QrloginModel.loginByQrcodeFailedApiInvalid,
        QrloginModel.loginByQrcodeFailedGetBdussError,
        QrloginModel.loginByQrcodeFailedGetFullCookieError,
      ]),
    },
    detail: {
      summary: '登陆',
      tags: ['二维码登录'],
    },
  })
