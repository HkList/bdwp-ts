import type { MaybePromise } from 'bun'
import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export type GetTaskInfoApiSuccessResponse<T = object> = T & {
  errno: 0
  task_errno: 0
} & (
    | {
        status: 'running'
        progress: number
      }
    | {
        status: 'success'
      }
  )

export type GetTaskInfoApiFailedResponse<T = object> = T & {
  errno: number
  status: 'failed'
  task_errno: string | number
}

export type GetTaskInfoResponse<T = object> =
  | ElysiaCustomStatusResponse<
      200,
      {
        message: '任务信息查询成功'
        data: GetTaskInfoApiSuccessResponse<T>
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: '任务查询失败, 接口可能失效'
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `任务查询失败: (${number}) (${string | number})`
        data: null
      }
    >
  | ElysiaCustomStatusResponse<
      500,
      {
        message: `任务查询成功: 任务状态为失败: (${number}) (${string | number})`
        data: GetTaskInfoApiFailedResponse<T>
      }
    >

export interface GetTaskInfoOptions {
  cookie: string
  task_id: string
  cid?: string
}

export interface WaitForTaskCompleteOptions<T = object> extends GetTaskInfoOptions {
  onTaskChecked?: (response: GetTaskInfoResponse<T>) => MaybePromise<void>
}

export async function waitForTaskComplete<T = object>(
  options: WaitForTaskCompleteOptions<T>,
): Promise<GetTaskInfoResponse<T>> {
  while (true) {
    const taskResponse = await getTaskInfo<T>(options)

    if (options.onTaskChecked) {
      await options.onTaskChecked(taskResponse)
    }

    if (taskResponse.code !== 200) {
      return taskResponse
    }

    const taskData = taskResponse.response.data
    if (taskData.status === 'running') {
      await Bun.sleep(1000)
      continue
    }

    return taskResponse
  }
}

export async function getTaskInfo<T = object>(
  options: GetTaskInfoOptions,
): Promise<GetTaskInfoResponse<T>> {
  let count = 0

  while (true) {
    const taskResponse = await _getTaskInfo<T>(options)
    if (taskResponse.code !== 200) {
      // 如果返回了字符串, 说明接口可能失效, 提前返回错误数据, 不再重试
      if (!taskResponse.response.message.includes('接口可能失效')) {
        return taskResponse
      }

      count++

      await Bun.sleep(1000)
      if (count >= 5) {
        return taskResponse
      }

      continue
    }

    return taskResponse
  }
}

export async function _getTaskInfo<T = object>(
  options: GetTaskInfoOptions,
): Promise<GetTaskInfoResponse<T>> {
  const response = await request.send<
    GetTaskInfoApiSuccessResponse<T>,
    GetTaskInfoApiFailedResponse<T>
  >(
    options.cid
      ? 'https://pan.baidu.com/mid_enterprise_v2/share/taskquery'
      : 'https://pan.baidu.com/share/taskquery',
    {
      method: 'get',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        Cookie: options.cookie,
      },
      searchParams: {
        web: '1',
        clienttype: bdwp_config.WEB_CLIENTTYPE,
        taskid: options.task_id,
        channel: bdwp_config.WEB_CHANNEL,
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
      message: '任务查询失败, 接口可能失效',
      data: null,
    })
  }

  if (response.errno !== 0) {
    return status(500, {
      message: `任务查询失败: (${response.errno}) (${response.task_errno})`,
      data: null,
    })
  }

  if (response.status === 'failed') {
    return status(500, {
      message: `任务查询成功: 任务状态为失败: (${response.errno}) (${response.task_errno})`,
      data: response,
    })
  }

  const typedResponse = response as GetTaskInfoApiSuccessResponse<T>

  return status(200, {
    message: '任务信息查询成功',
    data: typedResponse,
  })
}
