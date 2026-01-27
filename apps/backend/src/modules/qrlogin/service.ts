import type { QrloginModelType } from '@backend/modules/qrlogin/model.ts'
import { checkQrCodeStatus, getCookieByBduss, getFullCookie, getQrCode } from '@backend/api'
import { redis } from '@backend/services/redis.ts'
import { status } from 'elysia'

export class QrloginService {
  static async getQrCode() {
    return await getQrCode()
  }

  static async loginByQrcode({ sign }: QrloginModelType['loginByQrcodeQuery']) {
    const bdussResponse = await checkQrCodeStatus({ sign })
    if (bdussResponse.code === 500) {
      return status(500, {
        message: bdussResponse.response.message,
        data: null,
      })
    }

    if (bdussResponse.code === 202) {
      return bdussResponse
    }

    const cookie = await getCookieByBduss({
      bduss: bdussResponse.response.data.bduss,
    })

    if (cookie.code !== 200) {
      return cookie
    }

    const { bduss, stoken } = cookie.response.data
    const fullCookie = await getFullCookie({
      cookie: `BDUSS=${bduss}; STOKEN=${stoken};`,
    })

    if (fullCookie.code !== 200) {
      return fullCookie
    }

    const login_id = crypto.randomUUID()
    await redis.set(`login:${login_id}`, fullCookie.response.data.cookie)

    return status(200, {
      message: '登录成功',
      data: {
        login_id,
      },
    })
  }
}
