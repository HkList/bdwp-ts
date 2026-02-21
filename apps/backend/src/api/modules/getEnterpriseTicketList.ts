import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface EnterpriseTicketListItem {
  control_type: number
  expired_count: number
  expired_time: number
  package_count: number
  package_type: number
  recent_expired_time: number
  recent_remain_count: number
  recent_total_count: number
  recent_use_count: number
  remain_count: number
  start_time: number
  status: number
  total_count: number
  unit: string
  use_count: number
  value: number
}

export interface EnterpriseTicketListApiSuccessResponse {
  errno: 0
  show_msg: ''

  data: {
    package_list: EnterpriseTicketListItem[]
  }
}

export interface EnterpriseTicketListApiFailedResponse {
  errno: number
  show_msg: string
}

export type EnterpriseTicketListResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '获取企业票据列表成功'
      data: EnterpriseTicketListItem[]
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export interface GetEnterpriseTicketListOptions {
  cookie: string
  cid: string
  package_type_list?: number[]
}

export async function getEnterpriseTicketList(
  options: GetEnterpriseTicketListOptions,
): Promise<EnterpriseTicketListResponse> {
  const response = await request.send<
    EnterpriseTicketListApiSuccessResponse,
    EnterpriseTicketListApiFailedResponse
  >('https://pan.baidu.com/mid_enterprise_v2/ticket/api/list', {
    method: 'post',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      'Cookie': options.cookie,
    },
    searchParams: {
      clienttype: bdwp_config.PC_CLIENTTYPE,
      app_id: bdwp_config.ENTERPRISE_APP_ID,
      cid: options.cid,
      channel: bdwp_config.PC_CHANNEL,
      version: bdwp_config.PC_VERSION,
    },
    body: new URLSearchParams({
      tkappid: bdwp_config.ENTERPRISE_TK_APP_ID,
      package_type_list: JSON.stringify(options.package_type_list ?? [2]),
    }),
  })

  if (typeof response === 'string') {
    return status(500, {
      message: '获取企业票据列表失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取企业票据列表失败: ${response.show_msg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as EnterpriseTicketListApiSuccessResponse

  return status(200, {
    message: '获取企业票据列表成功',
    data: typedResponse.data.package_list ?? [],
  })
}
