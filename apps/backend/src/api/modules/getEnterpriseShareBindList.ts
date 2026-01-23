import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface EnterpriseShareBindListItem {
  avatar: string
  channel: 1 | 2
  ctime: number
  uk: number
  username: string
}

export interface EnterpriseShareBindListApiSuccessResponse {
  errno: 0
  show_msg: string

  data: {
    tkbind_list: EnterpriseShareBindListItem[] | null
    use_count: number
    total_count: number
  }
}

export interface EnterpriseShareBindListApiFailedResponse {
  errno: number
  show_msg: string
}

export type EnterpriseShareBindListResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取企业分享绑定列表成功'
        data: {
          tkbind_list: EnterpriseShareBindListItem[]
          use_count: number
          total_count: number
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

export async function getEnterpriseShareBindList(
  cookie: string,
  cid: string,
  shareid: string,
): Promise<EnterpriseShareBindListResponse> {
  const response = await request.send<
    EnterpriseShareBindListApiSuccessResponse,
    EnterpriseShareBindListApiFailedResponse
  >('https://pan.baidu.com/mid_enterprise_v2/ticket/api/getbindlist', {
    method: 'get',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      Cookie: cookie,
    },
    searchParams: {
      tkappid: bdwp_config.ENTERPRISE_TK_APP_ID,
      activity_id: shareid,
      clienttype: bdwp_config.ANDROID_CLIENTTYPE,
      app_id: bdwp_config.ENTERPRISE_APP_ID,
      cid,
    },
  })

  if (typeof response === 'string') {
    return status(500, {
      message: '获取企业分享绑定列表失败, 请检查 Cookie 是否有效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取企业分享绑定列表失败: ${response.show_msg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as EnterpriseShareBindListApiSuccessResponse

  return status(200, {
    message: '获取企业分享绑定列表成功',
    data: {
      tkbind_list: typedResponse.data.tkbind_list ?? [],
      use_count: typedResponse.data.use_count,
      total_count: typedResponse.data.total_count,
    },
  })
}
