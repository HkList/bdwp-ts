import type { QrloginModelType } from '@backend/modules/user/qrlogin/model.ts'
import { checkQrCodeStatus, getCookieByBduss, getFullCookie, getQrCode } from '@backend/api'
import { config } from '@backend/config.ts'
import { redis } from '@backend/services/redis.ts'
import { status } from 'elysia'

export class QrloginService {
  static async getQrCode() {
    const res = await getQrCode()
    if (res.code === 200) {
      await redis.set(`qrlogin:${res.response.data.sign}`, res.response.data.gid, 'EX', 60 * 10)
    }

    return res
  }

  static async loginByQrCode({ sign }: QrloginModelType['loginByQrCodeBody']) {
    const gid = await redis.get(`qrlogin:${sign}`)
    if (!gid) {
      return status(500, {
        message: '登录失败: gid查询失败',
        data: null,
      })
    }

    const bdussResponse = await checkQrCodeStatus({ sign, gid })
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
    await redis.set(`cookie:${login_id}`, fullCookie.response.data.cookie, 'EX', config.LOGIN_ID_EXPIRE)

    return status(200, {
      message: '登录成功',
      data: {
        login_id,
      },
    })
  }
}
