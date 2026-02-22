import type { TaskModelType } from '@backend/modules/task/model.ts'
import { redis } from '@backend/services/redis.ts'
import { createRedisMessageStream } from '@backend/utils/createRedisMessageStream.ts'
import { sse, status } from 'elysia'

export class TaskService {
  static async getTaskStatus({ task_id }: TaskModelType['GetTaskStatusQuery']) {
    const info = await redis.get(`task:${task_id}`)
    if (!info) {
      return status(404, {
        message: '任务不存在或已过期',
        data: null,
      })
    }

    try {
      const parsed = JSON.parse(info)
      return status(200, {
        message: '获取任务状态成功',
        data: parsed,
      })
    }
    catch {
      return status(500, {
        message: '任务状态解析失败',
        data: null,
      })
    }
  }

  static async* subscribeTaskStatus({ task_id }: TaskModelType['GetTaskStatusQuery']) {
    const info = await redis.get(`task:${task_id}`)
    if (!info) {
      yield sse({
        event: 'message',
        data: {
          message: '任务不存在或已过期',
          data: null,
        },
      })
      return
    }

    const data = JSON.parse(info)

    // 这里也用 sse 为了方便客户端进行逻辑的处理, 而不需要为 http 响应再单独做处理
    yield sse({
      event: 'message',
      data,
    })

    // 任务已完成或失败，不建立订阅
    if (data.status !== 'processing') {
      return
    }

    try {
      // 使用异步迭代器订阅 Redis 消息
      for await (const { message, close } of createRedisMessageStream(`task:update:${task_id}`)) {
        const data = JSON.parse(message)

        yield sse({
          event: 'message',
          data,
        })

        // 检查任务是否已完成或失败
        if (data.status !== 'processing') {
          await close()
          return
        }
      }
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('JSON')) {
        yield sse({
          event: 'error',
          data: {
            message: 'Redis JSON消息解析失败',
            data: null,
          },
        })
        return
      }

      yield sse({
        event: 'error',
        data: {
          message: '服务器内部错误',
        },
      })
    }
  }
}
