import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { redis } from '@backend/services/redis.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface GetQrCodeStatusApiSuccessResponse {
  errno: 0

  channel_id: string
  channel_v: string
}

export interface GetQrCodeStatusApiFailedResponse {
  errno: number
}

export type GetQrCodeStatusResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取二维码状态成功'
        data: {
          bduss: string
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
  | ElysiaCustomStatusResponse<
      202,
      {
        message: `获取二维码状态成功: ${'二维码等待确认中' | '二维码取消登录'}`
        data: null
      }
    >

export interface CheckQrCodeStatusOptions {
  sign: string
}

export async function checkQrCodeStatus(
  options: CheckQrCodeStatusOptions,
): Promise<GetQrCodeStatusResponse> {
  const gid = await redis.get(`qrlogin:${options.sign}`)
  if (!gid) {
    return status(500, {
      message: '获取二维码状态失败: gid查询失败',
      data: null,
    })
  }

  const response = await request.send<
    GetQrCodeStatusApiSuccessResponse,
    GetQrCodeStatusApiFailedResponse
  >('https://passport.baidu.com/channel/unicast', {
    method: 'get',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      Cookie: bdwp_config.UNAUTH_COOKIE,
    },
    searchParams: {
      channel_id: options.sign,
      gid,
      tpl: 'netdisk',
      apiver: 'v3',
      tt: Date.now(),
    },
  })

  if (typeof response === 'string') {
    return status(500, {
      message: '获取二维码状态失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取二维码状态失败: ${response.errno}`,
      data: null,
    })
  }

  const typedResponse = response as GetQrCodeStatusApiSuccessResponse
  const channel_v = JSON.parse(typedResponse.channel_v ?? '{}')
  const channelStatus: number = channel_v?.status ?? 0

  if (channelStatus === 1) {
    return status(202, {
      message: '获取二维码状态成功: 二维码等待确认中',
      data: null,
    })
  } else if (channelStatus === 2) {
    return status(202, {
      message: '获取二维码状态成功: 二维码取消登录',
      data: null,
    })
  } else if (channelStatus !== 0) {
    return status(500, {
      message: `获取二维码状态失败: ${channelStatus}`,
      data: null,
    })
  }

  const bduss: string = channel_v?.v
  if (!bduss) {
    return status(500, {
      message: `获取二维码状态失败: bduss获取失败`,
      data: null,
    })
  }

  return status(200, {
    message: '获取二维码状态成功',
    data: {
      bduss,
    },
  })
}
