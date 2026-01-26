import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface TemplateVariable {
  bdstoken: string
  uk: number
}

export interface TemplateVariableApiSuccessResponse {
  errno: 0
  result: TemplateVariable
}

export interface TemplateVariableApiFailedResponse {
  errno: number
  result: []
}

export type TemplateVariableResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取模板变量成功'
        data: TemplateVariable
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '获取模板变量失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `获取模板变量失败: (${number})`
        data: null
      }
    >

export interface GetTemplateVariableOptions {
  cookie: string
}

export async function getTemplateVariable(
  options: GetTemplateVariableOptions,
): Promise<TemplateVariableResponse> {
  const response = await request.send<
    TemplateVariableApiSuccessResponse,
    TemplateVariableApiFailedResponse
  >('https://pan.baidu.com/api/gettemplatevariable', {
    method: 'get',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      Cookie: options.cookie,
    },
    searchParams: {
      fields: JSON.stringify(['bdstoken', 'uk']),
    },
  })

  if (typeof response === 'string') {
    return status(500, {
      message: '获取模板变量失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0 || Array.isArray(response.result)) {
    return status(500, {
      message: `获取模板变量失败: (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as TemplateVariableApiSuccessResponse

  return status(200, {
    message: '获取模板变量成功',
    data: typedResponse.result,
  })
}
