import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface AccountInfo {
  avatar_url: string
  baidu_name: string
  netdisk_name: string
  uk: number
  vip_type: number
}

export interface AccountInfoApiSuccessResponse extends AccountInfo {
  errno: 0
  errmsg: 'succ'
}

export interface AccountInfoApiFailedResponse {
  errno: number
  errmsg: string
}

export type AccountInfoResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取账号信息成功'
        data: AccountInfo
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '获取账号信息失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `获取账号信息失败: ${string} (${number})`
        data: null
      }
    >

export interface GetAccountInfoOptions {
  cookie: string
}

export async function getAccountInfo(options: GetAccountInfoOptions): Promise<AccountInfoResponse> {
  const response = await request.send<AccountInfoApiSuccessResponse, AccountInfoApiFailedResponse>(
    'https://pan.baidu.com/rest/2.0/xpan/nas',
    {
      method: 'get',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        Cookie: options.cookie,
      },
      searchParams: {
        method: 'uinfo',
      },
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '获取账号信息失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0 || response.errmsg !== 'succ') {
    return status(500, {
      message: `获取账号信息失败: ${response.errmsg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as AccountInfoApiSuccessResponse

  return status(200, {
    message: '获取账号信息成功',
    data: {
      avatar_url: typedResponse.avatar_url,
      baidu_name: typedResponse.baidu_name,
      netdisk_name: typedResponse.netdisk_name,
      uk: typedResponse.uk,
      vip_type: typedResponse.vip_type,
    },
  })
}
