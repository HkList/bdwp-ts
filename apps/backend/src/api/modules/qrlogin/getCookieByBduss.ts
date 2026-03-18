import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface GetCookieByBdussApiSuccessResponse {
  code: '110000'
  message: ''

  data: {
    session: {
      bduss: string
      stokenList: string[]
    }
  }
}

export interface GetCookieByBdussApiFailedResponse {
  code: string
  message: string
}

export type GetCookieByBdussResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '获取CK成功'
      data: {
        bduss: string
        stoken: string
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

export interface GetCookieByBdussOptions {
  bduss: string
}

const fixResponseReg = /'(.*?)'/g

export async function getCookieByBduss(
  options: GetCookieByBdussOptions,
): Promise<GetCookieByBdussResponse> {
  let response = await request.send<
    GetCookieByBdussApiSuccessResponse,
    GetCookieByBdussApiFailedResponse
  >('https://passport.baidu.com/v3/login/main/qrbdusslogin', {
    method: 'get',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
      'Cookie': `BDUSS=${options.bduss};`,
    },
    searchParams: {
      v: Date.now(),
      bduss: options.bduss,
      u: 'http://passport.baidu.com',
      loginVersion: 'v5',
      qrcode: '1',
      tpl: 'netdisk',
      maskId: '',
      fileId: '',
      apiver: 'v3',
      tt: Date.now(),
    },
  })

  if (typeof response === 'string') {
    // 需要手动兼容
    const content = response
      .replace(fixResponseReg, '"$1"')
      .replaceAll('"[', '[')
      .replaceAll(']"', ']')
      .replaceAll('\\&quot;', '"')

    try {
      response = JSON.parse(content)
    }
    catch {
      return status(500, {
        message: '获取CK失败: 接口数据解析失败',
        data: null,
      })
    }
  }

  const responseJson = response as
    | GetCookieByBdussApiSuccessResponse
    | GetCookieByBdussApiFailedResponse

  if (responseJson.code !== '110000') {
    return status(500, {
      message: `获取CK失败: ${responseJson.message} (${responseJson.code})`,
      data: null,
    })
  }

  const typedResponseJson = responseJson as GetCookieByBdussApiSuccessResponse

  const bduss = typedResponseJson?.data?.session?.bduss
  if (!bduss) {
    return status(500, {
      message: '获取CK失败: bduss获取失败',
      data: null,
    })
  }

  const stokenList = typedResponseJson?.data?.session?.stokenList ?? []
  const stoken = stokenList.find(item => item.startsWith('netdisk#'))?.split('netdisk#')?.[1]
  if (!stoken) {
    return status(500, {
      message: '获取CK失败: stoken获取失败',
      data: null,
    })
  }

  return status(200, {
    message: '获取CK成功',
    data: {
      bduss,
      stoken,
    },
  })
}
