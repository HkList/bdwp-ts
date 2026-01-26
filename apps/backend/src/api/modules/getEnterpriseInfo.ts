import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface EnterpriseInfoItem {
  cid: number
  orgInfo: {
    name: string
  }
}

export interface EnterpriseInfoApiSuccessResponse {
  errno: 0
  newno: ''
  show_msg: ''

  data: EnterpriseInfoItem[]
}

export interface EnterpriseInfoApiFailedResponse {
  errno: number
  data: null
  show_msg: string
}

export type EnterpriseInfoResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取企业信息成功'
        data: EnterpriseInfoItem[]
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '获取企业信息失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `获取企业信息失败: ${string} (${number})`
        data: null
      }
    >

export interface GetEnterpriseInfoOptions {
  cookie: string
}

export async function getEnterpriseInfo(
  options: GetEnterpriseInfoOptions,
): Promise<EnterpriseInfoResponse> {
  const response = await request.send<
    EnterpriseInfoApiSuccessResponse,
    EnterpriseInfoApiFailedResponse
  >('https://pan.baidu.com/mid_enterprise_v2/api/enterprise/organization/allorganizationinfo', {
    method: 'get',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      Cookie: options.cookie,
    },
    searchParams: {
      clienttype: bdwp_config.WEB_CLIENTTYPE,
      app_id: bdwp_config.ENTERPRISE_APP_ID,
    },
  })

  if (typeof response === 'string') {
    return status(500, {
      message: '获取企业信息失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取企业信息失败: ${response.show_msg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as EnterpriseInfoApiSuccessResponse

  return status(200, {
    message: '获取企业信息成功',
    data: typedResponse.data,
  })
}
