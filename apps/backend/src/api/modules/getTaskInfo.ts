import type { MaybePromise } from 'bun'
import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export type GetTaskInfoApiSuccessResponse<T = object> = T & {
  errno: 0
  progress: number
  status: 'success' | 'running'
  task_errno: 0
}

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
        message: string
        data: null
      }
    >

export interface GetTaskInfoOptions<T = object> {
  cookie: string
  task_id: string
  onTaskChecked?: (response: GetTaskInfoResponse<T>) => MaybePromise<void>
  cid?: string
}

export async function waitForTaskComplete<T = object>(
  options: GetTaskInfoOptions<T>,
  onTaskChecked?: (response: GetTaskInfoResponse<T>) => MaybePromise<void>,
): Promise<GetTaskInfoResponse<T>> {
  while (true) {
    const taskResponse = await taskQuery<T>(options)
    if (taskResponse.code !== 200) {
      return taskResponse
    }

    if (onTaskChecked) {
      onTaskChecked(taskResponse)
    }

    const taskData = taskResponse.response.data
    if (taskData.status === 'running') {
      await Bun.sleep(1000)
      continue
    }

    return taskResponse
  }
}

export async function taskQuery<T = object>(
  options: GetTaskInfoOptions<T>,
): Promise<GetTaskInfoResponse<T>> {
  let count = 0

  while (true) {
    const taskResponse = await _taskQuery<T>(options)
    if (taskResponse.code !== 200) {
      count++

      await Bun.sleep(1000)
      if (count >= 5) {
        return status(500, {
          message: '任务查询失败, 接口可能失效',
          data: null,
        })
      }

      continue
    }

    return taskResponse
  }
}

export async function _taskQuery<T = object>(
  options: GetTaskInfoOptions<T>,
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
      message: `任务查询失败: (errno: ${response.errno}) (task_errno: ${response.task_errno})`,
      data: null,
    })
  }

  const typedResponse = response as GetTaskInfoApiSuccessResponse<T>

  return status(200, {
    message: '任务信息查询成功',
    data: typedResponse,
  })
}
