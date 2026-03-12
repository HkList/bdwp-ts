import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { redis } from '@backend/services/redis.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface GetQrCodeApiSuccessResponse {
  errno: 0

  imgurl: string
  sign: string
  prompt: string
}

export interface GetQrCodeApiFailedResponse {
  errno: number
}

export type GetQrCodeResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '获取二维码成功'
      data: GetQrCodeApiSuccessResponse
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export async function getQrCode(): Promise<GetQrCodeResponse> {
  const gid = crypto.randomUUID().toUpperCase()

  const response = await request.send<GetQrCodeApiSuccessResponse, GetQrCodeApiFailedResponse>(
    'https://passport.baidu.com/v2/api/getqrcode',
    {
      method: 'get',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        'Cookie': bdwp_config.UNAUTH_COOKIE,
      },
      searchParams: {
        lp: 'pc',
        gid,
        apiver: 'v3',
        tt: Date.now(),
      },
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '获取二维码失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取二维码失败: ${response.errno}`,
      data: null,
    })
  }

  const typedResponse = response as GetQrCodeApiSuccessResponse

  await redis.set(`qrlogin:${typedResponse.sign}`, gid, 'EX', 60 * 2)

  return status(200, {
    message: '获取二维码成功',
    data: typedResponse,
  })
}
