import type { SmsLoginModelType } from '@backend/modules/user/smslogin/model.ts'
import { checkPhoneStatus, getFullCookie, loginBySms, sendSms } from '@backend/api'
import { config } from '@backend/config.ts'
import { redis } from '@backend/services/redis.ts'
import { status } from 'elysia'

export class SmsLoginService {
  static async sendSms({ phone }: SmsLoginModelType['sendSmsBody']) {
    const res = await checkPhoneStatus({ phone })
    if (res.code !== 200) {
      return res
    }

    await redis.set(`smslogin:${phone}:BAIDUUID`, res.response.data.BAIDUID, 'EX', 60 * 10)
    await redis.set(`smslogin:${phone}:gid`, res.response.data.gid, 'EX', 60 * 10)

    return await sendSms({ phone, gid: res.response.data.gid, BAIDUID: res.response.data.BAIDUID })
  }

  static async loginBySms({ phone, smsvc }: SmsLoginModelType['loginBySmsBody']) {
    const gid = await redis.get(`smslogin:${phone}:gid`)
    const BAIDUID = await redis.get(`smslogin:${phone}:BAIDUUID`)
    if (!gid || !BAIDUID) {
      return status(403, {
        message: '请先获取手机号状态',
        data: null,
      })
    }

    const loginBySmsRes = await loginBySms({ phone, smsvc, BAIDUID, gid })
    if (loginBySmsRes.code !== 200) {
      return loginBySmsRes
    }

    const cookieRes = await getFullCookie({
      cookie: `BDUSS=${loginBySmsRes.response.data.bduss};STOKEN=${loginBySmsRes.response.data.stoken};`,
    })
    if (cookieRes.code !== 200) {
      return cookieRes
    }

    const login_id = crypto.randomUUID()
    await redis.set(`cookie:${login_id}`, cookieRes.response.data.cookie, 'EX', config.LOGIN_ID_EXPIRE)

    return status(200, {
      message: '短信登陆成功',
      data: {
        login_id,
      },
    })
  }
}
