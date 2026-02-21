import type { GetTaskInfoResponse, WxFileItem } from '@backend/api'
import type { MaybePromise } from 'bun'
import type { ElysiaCustomStatusResponse } from 'elysia'
import { waitForTaskComplete } from '@backend/api'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface TransferFileExtraItem {
  from: string
  from_fs_id: number
  to: string
  to_fs_id: number
}

export interface TranferFileInfoItem {
  errno: number
  fsid: number
  path: string
}

export interface TransferFileApiSuccessResponse {
  errno: 0
  extra: {
    list: TransferFileExtraItem[]
  }
  info: TranferFileInfoItem[]
  show_msg: ''
  taskid?: number
}

export interface TransferFileAsyncApiSuccessObject {
  list: TransferFileExtraItem[]
}

export interface TransferFileApiFailedResponse {
  errno: number
  show_msg: string
  duplicated?: {
    list: WxFileItem[]
  }
}

export type TransferFileResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '转存文件成功'
      data: TransferFileExtraItem[]
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export interface TransferFileOptions {
  cookie: string
  cid?: string
  shareid: number
  from: number
  ondup?: 'overwrite' | 'newcopy' | 'fail'
  sekey: string
  fsidlist: number[]
  path: string
  onTaskChecked?: (
    response: GetTaskInfoResponse<TransferFileAsyncApiSuccessObject>,
  ) => MaybePromise<void>
}

export async function transferFile(options: TransferFileOptions): Promise<TransferFileResponse> {
  const response = await request.send<
    TransferFileApiSuccessResponse,
    TransferFileApiFailedResponse
  >(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/share/transfer'
      : 'http://pan.baidu.com/share/transfer',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.PC_USERAGENT,
        'Cookie': options.cookie,
      },
      searchParams: {
        clienttype: bdwp_config.PC_CLIENTTYPE,
        channel: bdwp_config.PC_CHANNEL,
        version: bdwp_config.PC_VERSION,
        shareid: options.shareid.toString(),
        from: options.from.toString(),
        ondup: options.ondup ?? 'newcopy',
        async: '1',
        sekey: options.sekey,
        ...(options.cid
          ? {
              cid: options.cid,
              app_id: bdwp_config.ENTERPRISE_APP_ID,
            }
          : {}),
      },
      body: new URLSearchParams({
        fsidlist: JSON.stringify(options.fsidlist),
        path: options.path,
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '转存文件失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `转存文件失败: ${response.show_msg} (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as TransferFileApiSuccessResponse

  if (typedResponse.taskid) {
    const res = await waitForTaskComplete<TransferFileAsyncApiSuccessObject>({
      cookie: options.cookie,
      task_id: typedResponse.taskid.toString(),
      cid: options.cid,
      onTaskChecked: options.onTaskChecked,
    })

    if (res.code !== 200) {
      return status(500, {
        message: `转存文件失败: ${res.response.message}`,
        data: res.response.data,
      })
    }

    return status(200, {
      message: '转存文件成功',
      data: res.response.data.list,
    })
  }

  return status(200, {
    message: '转存文件成功',
    data: typedResponse.extra.list,
  })
}
