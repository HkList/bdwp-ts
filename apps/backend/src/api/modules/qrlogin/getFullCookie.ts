import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export type GetFullCookieResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取完整CK成功'
        data: {
          cookie: string
        }
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `获取完整CK失败`
        data: null
      }
    >

export interface GetFullCookieOptions {
  cookie: string
}

export async function getFullCookie(options: GetFullCookieOptions): Promise<GetFullCookieResponse> {
  try {
    const response = await request.client('https://pan.baidu.com/disk/main', {
      method: 'get',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        Cookie: options.cookie,
      },
    })

    let cookie = ''
    response.headers.getSetCookie().forEach((ck) => {
      const ckArr = ck.split(';')
      cookie += `${ckArr[0]};`
    })

    return status(200, {
      message: '获取完整CK成功',
      data: {
        cookie: cookie + options.cookie,
      },
    })
  } catch {
    return status(500, {
      message: `获取完整CK失败`,
      data: null,
    })
  }
}
