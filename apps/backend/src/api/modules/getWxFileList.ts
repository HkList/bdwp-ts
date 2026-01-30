import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface WxFileItem {
  category: string
  fs_id: string
  is_dir: '1' | '0'
  local_ctime: string
  local_mtime: string
  md5?: string
  path: string
  server_ctime: string
  server_filename: string
  server_mtime: string
  size: number
}

export interface ParsedWxFileItem {
  category: number
  fs_id: number
  is_dir: boolean
  local_ctime: number
  local_mtime: number
  md5: string
  path: string
  server_ctime: number
  server_filename: string
  server_mtime: number
  size: number
}

export interface WxFileListData {
  title: string
  link_ctime: number
  has_more: boolean
  list: ParsedWxFileItem[]
  user: {
    avatar: string
  }
  uname: string
  uk: number
  shareid: number
  seckey: string
}

export interface FileListApiSuccessResponse {
  errno: 0
  errtype: 0
  data: Omit<WxFileListData, 'list'> & {
    list: WxFileItem[]
  }
}

export interface FileListApiErrorResponse {
  errno: number
  errtype: string | number
  data: {
    title: string
    expiredType: number
    link_ctime: number
    fileNums: number
    has_more: boolean
    list: []
  }
}

export type FileListResponse =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '获取文件列表成功'
        data: WxFileListData
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: string
        data: null
      }
    >

// 错误类型映射
export const errorMessages: Record<string | number, Record<string | number, string>> = {
  [-6]: {
    0: '请不要使用密享链接',
  },
  [-130]: {
    0: '啊哦，你来晚了，分享的文件已经被删除了，下次要早点哟。',
    1: '啊哦，你来晚了，分享的文件已经被删除了，下次要早点哟。',
    2: '此链接分享内容暂时不可访问',
    3: '此链接分享内容可能因为涉及侵权、色情、反动、低俗等信息，无法访问！',
    5: '啊哦！链接错误没找到文件，请打开正确的分享链接!',
    10: '啊哦，来晚了，该分享文件已过期',
    11: '由于访问次数过多，该分享链接已失效',
    12: '因该分享含有自动备份文件夹，暂无法查看',
    15: '系统升级，链接暂时无法查看，升级完成后恢复正常。',
    17: '该链接访问范围受限，请使用正常的访问方式',
    123: '该链接已超过访问人数上限，可联系分享者重新分享',
    124: '您访问的链接已被冻结，可联系分享者进行激活',
    mis_105: '你所解析的文件不存在~',
    mispw_9: '提取码错误',
    'mispwd-9': '提取码错误',
    mis_2: '不存在此目录',
    mis_4: '不存在此目录',
    default: '分享的文件不存在',
  },
}

export interface GetWxFileListOptions {
  surl: string
  pwd?: string
  dir?: string
  page?: number
  num?: number
  order?: 'filename' | 'time' | 'size' | 'type'
}

export async function getWxFileList(options: GetWxFileListOptions): Promise<FileListResponse> {
  const { pwd = '', dir = '/', page = 1, num = 1000, order = 'filename' } = options
  let { surl } = options

  // 处理 surl，确保以 "1" 开头
  if (/^\d/.test(surl)) {
    surl = surl.substring(1)
  }
  surl = `1${surl}`

  const response = await request.send<FileListApiSuccessResponse, FileListApiErrorResponse>(
    'https://pan.baidu.com/share/wxlist',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.WX_USERAGENT,
        Cookie: bdwp_config.UNAUTH_COOKIE,
      },
      searchParams: {
        channel: bdwp_config.WX_CHANNEL,
        version: bdwp_config.WX_VERSION,
        clienttype: bdwp_config.WX_CLIENTTYPE,
        web: '1',
        'qq-pf-to': 'pcqq.c2c',
      },
      body: new URLSearchParams({
        shorturl: surl,
        pwd,
        dir,
        root: dir === '/' ? '1' : '0',
        page: page.toString(),
        num: Math.min(num, 100).toString(),
        order,
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '获取文件列表失败: 接口可能失效',
      data: null,
    })
  }

  const errno = response.errno
  const errtype = response.errtype

  if (errno !== 0) {
    const info = errorMessages[errno]?.[errtype] ?? errorMessages[errno]?.default ?? `未知错误`

    return status(500, {
      message: `获取文件列表失败: ${info} (${errno}) (${errtype})`,
      data: null,
    })
  }

  if (!response.data) {
    return status(500, {
      message: '获取文件列表失败: 无数据返回',
      data: null,
    })
  }

  const typedResponse = response as FileListApiSuccessResponse

  const pasedSeckey = typedResponse.data.seckey
    .replace(/-/g, '+')
    .replace(/~/g, '=')
    .replace(/_/g, '/')

  const parsedList = typedResponse.data.list.map((item) => ({
    category: Number.parseInt(item.category),
    fs_id: Number.parseInt(item.fs_id),
    is_dir: item.is_dir === '1',
    local_ctime: Number.parseInt(item.local_ctime),
    local_mtime: Number.parseInt(item.local_mtime),
    md5: item.md5 ?? '',
    path: item.path,
    server_ctime: Number.parseInt(item.server_ctime),
    server_filename: item.server_filename,
    server_mtime: Number.parseInt(item.server_mtime),
    size: item.size,
  }))

  return status(200, {
    message: '获取文件列表成功',
    data: {
      ...typedResponse.data,
      seckey: pasedSeckey,
      list: parsedList,
    },
  })
}
