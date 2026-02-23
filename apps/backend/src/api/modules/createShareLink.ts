import type { ElysiaCustomStatusResponse } from 'elysia'
import { createFolder, getList } from '@backend/api/index.ts'
import { bdwp_config } from '@backend/config.ts'
import { randomString } from '@backend/utils/randomString.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface CreateShareLinkApiSuccessResponse {
  errno: 0
  show_msg: ''

  aheadmsg: string
  command_word: string
  createsharetips_ldlj: string
  ctime: number
  expiredType: number
  expiretime: number
  imagetype: number
  kid: number
  link: string
  premis: boolean
  prompt_type: number
  qrcodeurl: string
  shareid: number
  shorturl: string
  tailmsg: string
}

export interface CreateShareLinkApiFailedResponse {
  errno: number
  show_msg: string
}

export type CreateShareLinkResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '创建分享链接成功'
      data: CreateShareLinkApiSuccessResponse
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export type CreateShareLinkOptions = (
  | {
    fid_list: number[]
  }
  | {
    path_list: string[]
  }
) & {
  cookie: string
  pwd: string
  /** 分享链接有效期，单位为天，0为永久有效 */
  period: number
  cid?: string
  ticket_count?: number
}

export async function createShareLink(
  options: CreateShareLinkOptions,
): Promise<CreateShareLinkResponse> {
  const response = await request.send<
    CreateShareLinkApiSuccessResponse,
    CreateShareLinkApiFailedResponse
  >(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/share/set'
      : 'https://pan.baidu.com/share/pset',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        'Cookie': options.cookie,
      },
      searchParams: {
        clienttype: bdwp_config.PC_CLIENTTYPE,
        channel: bdwp_config.PC_CHANNEL,
        version: bdwp_config.PC_VERSION,
        ...(options.cid
          ? {
              cid: options.cid,
              app_id: bdwp_config.ENTERPRISE_APP_ID,
            }
          : {}),
      },
      body: new URLSearchParams({
        period: options.period.toString(),
        pwd: options.pwd,
        channel_list: '[]',
        schannel: '4',
        ...('fid_list' in options
          ? {
              fid_list: JSON.stringify(options.fid_list),
            }
          : {
              path_list: JSON.stringify(options.path_list),
            }),
        ...(options.ticket_count && options.ticket_count > 0
          ? { ticket: JSON.stringify({ package_type: 2, count: options.ticket_count }) }
          : {}),
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '创建分享链接失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `创建分享链接失败: ${response.show_msg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as CreateShareLinkApiSuccessResponse

  return status(200, {
    message: '创建分享链接成功',
    data: typedResponse,
  })
}

export interface CreateShareLinkWithAutoMakePathOptions extends Omit<CreateShareLinkOptions, 'fid_list' | 'path_list'> {}

export interface CreateShareLinkWithAutoMakePathApiSuccessResponse extends CreateShareLinkApiSuccessResponse {
  path: string
}

export type CreateShareLinkWithAutoMakePathResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '创建分享链接成功'
      data: CreateShareLinkWithAutoMakePathApiSuccessResponse
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export async function createShareLinkWithAutoMakePath(
  options: CreateShareLinkWithAutoMakePathOptions,
): Promise<CreateShareLinkWithAutoMakePathResponse> {
  const path = `/${randomString(16)}`

  // 获取文件夹内容
  const getListRes = await getList({
    cookie: options.cookie,
    cid: options.cid,
    dir: path,
  })
  if (getListRes.code === 200) {
    // 如果code是200，说明文件夹已经存在
    // 重新开始创建
    return await createShareLinkWithAutoMakePath(options)
  }

  // 创建文件夹
  const createFolderRes = await createFolder({
    cookie: options.cookie,
    cid: options.cid,
    path,
  })
  if (createFolderRes.code !== 200) {
    return createFolderRes
  }

  // 创建分享链接
  const createShareLinkRes = await createShareLink({
    cookie: options.cookie,
    cid: options.cid,
    path_list: [path],
    period: options.period,
    pwd: options.pwd,
    ticket_count: options.ticket_count,
  })
  if (createShareLinkRes.code !== 200) {
    return createShareLinkRes
  }

  const typedData = createShareLinkRes.response.data as CreateShareLinkApiSuccessResponse

  return status(200, {
    message: '创建分享链接成功',
    data: {
      ...typedData,
      path,
    },
  })
}
