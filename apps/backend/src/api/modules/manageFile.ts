import type { GetTaskInfoResponse } from '@backend/api'
import type { MaybePromise } from 'bun'
import type { ElysiaCustomStatusResponse } from 'elysia'
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

// export interface DeleteFileAsyncFailedInfoItem {}

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

// export interface RenameFileAsyncFailedInfoItem {
//   error_code: number
//   from: string
//   to: string
// }

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

// export interface MoveOrCopyFileAsyncFailedInfoItem {
//   error_code: number
//   from: string
//   to: string
// }

export interface ManageFileBaseOptions<K = object> {
  cookie: string
  async?: 0 | 1 | 2
  ondup?: 'fail' | 'newcopy' | 'overwrite' | 'skip'
  cid?: string
  onTaskChecked?: (response: GetTaskInfoResponse<K>) => MaybePromise<void>
}

export interface DeleteFileOptions<K = object> extends ManageFileBaseOptions<K> {
  filelist: string[]
}

export interface RenameFileOptions<K = object> extends ManageFileBaseOptions<K> {
  filelist: { path: string, newname: string }[]
}

export interface MoveOrCopyFileOptions<K = object> extends ManageFileBaseOptions<K> {
  filelist: { path: string, dest: string }[]
}

export interface FileOpMap<K = object> {
  delete: {
    success: DeleteFileSuccessInfoItem
    failed: DeleteFileFailedInfoItem
    options: DeleteFileOptions<K>
    asyncSuccess: DeleteFileAsyncSuccessInfoItem
    // asyncFailed: DeleteFileAsyncFailedInfoItem
  }
  rename: {
    success: RenameFileSuccessInfoItem
    failed: RenameFileFailedInfoItem
    options: RenameFileOptions<K>
    asyncSuccess: RenameFileAsyncSuccessInfoItem
    // asyncFailed: RenameFileAsyncFailedInfoItem
  }
  move: {
    success: MoveOrCopyFileSuccessInfoItem
    failed: MoveOrCopyFileFailedInfoItem
    options: MoveOrCopyFileOptions<K>
    asyncSuccess: MoveOrCopyFileAsyncSuccessInfoItem
    // asyncFailed: MoveOrCopyFileAsyncFailedInfoItem
  }
  copy: FileOpMap['move']
}

export interface ManageFileApiSuccessResponse<T extends keyof FileOpMap> {
  errno: 0
  info: FileOpMap[T]['success'][] | FileOpMap[T]['asyncSuccess'][]
  taskid?: number
}

export interface ManageFileApiFailedResponse<T extends keyof FileOpMap> {
  errno: number
  info: FileOpMap[T]['failed'][]
}

export type ManageFileResponse<T extends keyof FileOpMap>
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '操作文件成功'
      data: ManageFileApiSuccessResponse<T>['info']
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export const ondupMap = {
  delete: 'fail',
  copy: 'newcopy',
  move: 'overwrite',
  rename: 'overwrite',
}

export async function manageFile<T extends keyof FileOpMap>(
  method: T,
  options: FileOpMap[T]['options'],
): Promise<ManageFileResponse<T>> {
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
        'Cookie': options.cookie,
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
      message: '操作文件失败: 接口可能失效',
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

  if (typedResponse.taskid) {
    const res = await waitForTaskComplete<{
      list: FileOpMap[T]['asyncSuccess'][]
    }>({
      cookie: options.cookie,
      task_id: typedResponse.taskid.toString(),
      cid: options.cid,
      onTaskChecked: options.onTaskChecked,
    })

    if (res.code !== 200) {
      return status(500, {
        message: `操作文件失败: ${res.response.message}`,
        data: null,
      })
    }

    return status(200, {
      message: '操作文件成功',
      data: res.response.data.list,
    })
  }

  return status(200, {
    message: '操作文件成功',
    data: typedResponse.info,
  })
}
