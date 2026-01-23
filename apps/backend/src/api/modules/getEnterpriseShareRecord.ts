import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface ShareRecordItem {
  creator_uk: number
  ctime: number
  fsIds: number[]
  passwd: string
  shareId: number
  shortlink: string
  shorturl: string
  typicalPath: string
}

export interface EnterpriseShareRecordApiSuccessResponse {
  errno: 0
  show_msg: string

  count: number
  list: ShareRecordItem[]
}

export interface EnterpriseShareRecordApiFailedResponse {
  errno: number
  show_msg: string
}

export type EnterpriseShareRecordResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取企业分享记录成功'
        data: ShareRecordItem[]
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: string
        data: null
      }
    >

export async function getEnterpriseShareRecord(
  cookie: string,
  cid: string,
): Promise<EnterpriseShareRecordResponse> {
  const list: ShareRecordItem[] = []
  let page = 1

  while (true) {
    const response = await request.send<
      EnterpriseShareRecordApiSuccessResponse,
      EnterpriseShareRecordApiFailedResponse
    >('https://pan.baidu.com/mid_enterprise_v2/share/record', {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        Cookie: cookie,
      },
      searchParams: {
        channel: bdwp_config.WEB_CHANNEL,
        clienttype: bdwp_config.WEB_CLIENTTYPE,
        app_id: bdwp_config.ENTERPRISE_APP_ID,
        third_account_type: '1',
        num: '100',
        page,
        web: '1',
        order: 'ctime',
        desc: '1',
        cid,
        is_batch: '1',
      },
    })

    if (typeof response === 'string') {
      return status(500, {
        message: '获取企业分享记录失败, 接口可能失效',
        data: null,
      })
    }

    if (response.errno !== 0) {
      return status(500, {
        message: `获取企业分享记录失败: ${response.show_msg} (${response.errno})`,
        data: null,
      })
    }

    const typedResponse = response as EnterpriseShareRecordApiSuccessResponse

    if (typedResponse.count === 0) {
      break
    }

    page++

    const newList = typedResponse.list.filter(
      (record) =>
        !record.typicalPath.includes('分享的文件已被删除') &&
        !record.typicalPath.includes('分享已过期'),
    )

    list.push(...newList)
  }

  return status(200, {
    message: '获取企业分享记录成功',
    data: list,
  })
}
