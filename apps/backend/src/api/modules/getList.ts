import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface FileItem {
  server_filename: string
  isdir: 0 | 1
  size: number
  path: string
  fs_id: number
  server_mtime: number
}

export interface GetListApiSuccessResponse {
  errno: 0
  list: FileItem[]
}

export interface GetListApiFailedResponse {
  errno: number
}

export type GetListResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '获取文件列表成功'
      data: FileItem[]
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export interface GetListOptions {
  cookie: string
  cid?: string
  order?: 'filename' | 'time' | 'size' | 'type'
  desc?: 0 | 1
  dir: string
  num?: number
  page?: number
}

export async function getList(options: GetListOptions): Promise<GetListResponse> {
  const response = await request.send<GetListApiSuccessResponse, GetListApiFailedResponse>(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/api/list'
      : 'http://pan.baidu.com/api/list',
    {
      method: 'get',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        'Cookie': options.cookie,
      },
      searchParams: {
        clienttype: bdwp_config.WEB_CLIENTTYPE,
        web: '1',
        order: options.order ?? 'time',
        desc: options.desc ?? 1,
        dir: options.dir,
        num: options.num ?? 100,
        page: options.page ?? 1,
        ...(options.cid
          ? {
              cid: options.cid,
              app_id: bdwp_config.ENTERPRISE_APP_ID,
            }
          : {
              app_id: bdwp_config.WEB_APP_ID,
            }),
      },
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '获取文件列表失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `获取文件列表失败: ${response.errno}`,
      data: null,
    })
  }

  const typedResponse = response as GetListApiSuccessResponse

  return status(200, {
    message: '获取文件列表成功',
    data: typedResponse.list,
  })
}
