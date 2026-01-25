import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface CreateFolderApiSuccessResponse {
  errno: 0

  ctime: number
  fs_id: number
  isdir: 1
  mtime: number
  path: string
  status: 0
  name: string
  category: 6
}

export interface CreateFolderApiFailedResponse {
  errno: number
}

export type CreateFolderResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '创建文件夹成功'
        data: CreateFolderApiSuccessResponse
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '创建文件夹失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `创建文件夹失败: (${number})`
        data: null
      }
    >

export interface CreateFolderOptions {
  cookie: string
  path: string
  cid?: string
}

export async function createFolder(options: CreateFolderOptions): Promise<CreateFolderResponse> {
  const response = await request.send<
    CreateFolderApiSuccessResponse,
    CreateFolderApiFailedResponse
  >(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/api/create'
      : 'https://pan.baidu.com/api/create',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.PC_USERAGENT,
        Cookie: options.cookie,
      },
      searchParams: {
        clienttype: bdwp_config.PC_CLIENTTYPE,
        channel: bdwp_config.PC_CHANNEL,
        version: bdwp_config.PC_VERSION,
        ...(options.cid
          ? {
              app_id: bdwp_config.ENTERPRISE_APP_ID,
              cid: options.cid.toString(),
            }
          : {
              app_id: bdwp_config.WEB_APP_ID,
            }),
      },
      body: new URLSearchParams({
        isdir: '1',
        path: options.path,
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '创建文件夹失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `创建文件夹失败: (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as CreateFolderApiSuccessResponse

  return status(200, {
    message: '创建文件夹成功',
    data: typedResponse,
  })
}
