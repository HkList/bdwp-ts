import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
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
      data: GetQrCodeApiSuccessResponse & {
        link: string
        gid: string
      }
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

  if (!typedResponse.imgurl.startsWith('http')) {
    typedResponse.imgurl = `https://${typedResponse.imgurl}`
  }

  return status(200, {
    message: '获取二维码成功',
    data: {
      ...typedResponse,
      link: `https://wappass.baidu.com/wp/?qrlogin&t=${Date.now()}&error=0&sign=${typedResponse.sign}&cmd=login&lp=pc&tpl=netdisk&adapter=3&qrloginfrom=pc&local=`,
      gid,
    },
  })
}
