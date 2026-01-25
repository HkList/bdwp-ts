import type {
  GetTaskInfoApiFailedResponse,
  GetTaskInfoResponse,
} from '@backend/api/modules/getTaskInfo.ts'
import type { ElysiaCustomStatusResponse, MaybePromise } from 'elysia'
import { waitForTaskComplete } from '@backend/api'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface DeleteFileSuccessInfoItem {
  errno: number
  path: string
}

export interface DeleteFileFailedInfoItem {
  errno: number
  path: string
}

export interface DeleteFileAsyncSuccessInfoItem {
  isdir: '0' | '1'
  path: string
  real_server_mtime: string
  server_mtime: string
  size: string
}

export interface DeleteFileAsyncFailedInfoItem {}

export interface RenameFileSuccessInfoItem {
  errno: number
  path: string
  to_path: string
}

export interface RenameFileFailedInfoItem {
  errno: number
  path: string
  to_path: string
}

export interface RenameFileAsyncSuccessInfoItem {
  from: string
  to: string
}

export interface RenameFileAsyncFailedInfoItem {
  error_code: number
  from: string
  to: string
}

export interface MoveOrCopyFileSuccessInfoItem {
  errno: number
  path: string
  to_fs_id: number
  to_path: string
}

export interface MoveOrCopyFileFailedInfoItem {
  errno: number
  path: string
}

export interface MoveOrCopyFileAsyncSuccessInfoItem {
  errno: number
  path: string
  to_fs_id: number
  to_path: string
}

export interface MoveOrCopyFileAsyncFailedInfoItem {
  error_code: number
  from: string
  to: string
}

export interface ManageFileBaseOptions {
  cookie: string
  async?: 0 | 1 | 2
  wait_finish?: boolean
  ondup?: 'fail' | 'newcopy' | 'overwrite' | 'skip'
  cid?: string
}

export interface DeleteFileOptions extends ManageFileBaseOptions {
  filelist: string[]
}

export interface RenameFileOptions extends ManageFileBaseOptions {
  filelist: { path: string; newname: string }[]
}

export interface MoveOrCopyFileOptions extends ManageFileBaseOptions {
  filelist: { path: string; dest: string }[]
}

export interface FileOpMap {
  delete: {
    success: DeleteFileSuccessInfoItem
    failed: DeleteFileFailedInfoItem
    options: DeleteFileOptions
    asyncSuccess: DeleteFileAsyncSuccessInfoItem
    asyncFailed: DeleteFileAsyncFailedInfoItem
  }
  rename: {
    success: RenameFileSuccessInfoItem
    failed: RenameFileFailedInfoItem
    options: RenameFileOptions
    asyncSuccess: RenameFileAsyncSuccessInfoItem
    asyncFailed: RenameFileAsyncFailedInfoItem
  }
  move: {
    success: MoveOrCopyFileSuccessInfoItem
    failed: MoveOrCopyFileFailedInfoItem
    options: MoveOrCopyFileOptions
    asyncSuccess: MoveOrCopyFileAsyncSuccessInfoItem
    asyncFailed: MoveOrCopyFileAsyncFailedInfoItem
  }
  copy: FileOpMap['move']
}

export interface ManageFileApiSuccessResponse<T extends keyof FileOpMap> {
  errno: 0
  info: (FileOpMap[T]['success'] | FileOpMap[T]['asyncSuccess'])[]
  taskid?: number
}

export interface ManageFileApiFailedResponse<T extends keyof FileOpMap> {
  errno: number
  info: (FileOpMap[T]['failed'] | FileOpMap[T]['asyncFailed'])[]
}

export type ManageFileResponse<
  T extends keyof FileOpMap,
  K extends {
    list: (FileOpMap[T]['asyncSuccess'] | FileOpMap[T]['asyncFailed'])[]
  },
> =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '操作文件成功'
        data: ManageFileApiSuccessResponse<T>['info']
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '操作文件失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `操作文件失败: (${number})`
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `操作文件失败: 任务查询失败, 接口可能失效`
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `操作文件失败: 任务查询失败: (${number}) (${string | number})`
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `操作文件失败: 任务查询成功: 任务状态为失败: (${number}) (${string | number})`
        data: GetTaskInfoApiFailedResponse<K>
      }
    >

export const ondupMap = {
  delete: 'fail',
  copy: 'newcopy',
  move: 'overwrite',
  rename: 'overwrite',
}

export async function manageFile<
  T extends keyof FileOpMap,
  K extends {
    list: (FileOpMap[T]['asyncSuccess'] | FileOpMap[T]['asyncFailed'])[]
  },
>(
  method: T,
  options: FileOpMap[T]['options'],
  onTaskChecked?: (response: GetTaskInfoResponse<K>) => MaybePromise<void>,
): Promise<ManageFileResponse<T, K>> {
  const response = await request.send<
    ManageFileApiSuccessResponse<T>,
    ManageFileApiFailedResponse<T>
  >(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/api/filemanager'
      : 'http://pan.baidu.com/api/filemanager',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.PC_USERAGENT,
        Cookie: options.cookie,
      },
      searchParams: {
        async: (options.async ?? 1).toString(),
        opera: method,
        clienttype: bdwp_config.PC_CLIENTTYPE,
        channel: bdwp_config.PC_CHANNEL,
        version: bdwp_config.PC_VERSION,
        ondup: options.ondup ?? ondupMap[method],
        ...(options.cid
          ? {
              cid: options.cid,
              app_id: bdwp_config.ENTERPRISE_APP_ID,
            }
          : {}),
      },
      body: new URLSearchParams({
        filelist: JSON.stringify(options.filelist),
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '操作文件失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `操作文件失败: (${response.errno})`,
      data: null,
    })
  }

  const typedResponse = response as ManageFileApiSuccessResponse<T>

  if (typedResponse.taskid && (options.wait_finish || !('wait_finish' in options))) {
    const res = await waitForTaskComplete<K>(
      {
        cookie: options.cookie,
        task_id: typedResponse.taskid.toString(),
        cid: options.cid,
      },
      onTaskChecked,
    )

    if (res.code !== 200) {
      if (res.response.message === '任务查询失败, 接口可能失效') {
        return status(500, {
          message: `操作文件失败: 任务查询失败, 接口可能失效`,
          data: null,
        })
      } else if (res.response.message.startsWith('任务查询失败')) {
        const typedRes = res as ElysiaCustomStatusResponse<
          500,
          {
            message: `任务查询失败: (${number}) (${string | number})`
            data: null
          }
        >

        return status(500, {
          message: `操作文件失败: ${typedRes.response.message}`,
          data: null,
        })
      } else {
        const typedRes = res as ElysiaCustomStatusResponse<
          500,
          {
            message: `任务查询成功: 任务状态为失败: (${number}) (${string | number})`
            data: GetTaskInfoApiFailedResponse<K>
          }
        >

        return status(500, {
          message: `操作文件失败: ${typedRes.response.message}`,
          data: typedRes.response.data,
        })
      }
    }

    return status(200, {
      message: '操作文件成功',
      data: res.response.data.list as FileOpMap[T]['asyncSuccess'][],
    })
  }

  return status(200, {
    message: '操作文件成功',
    data: typedResponse.info,
  })
}
