import type { TaskModelType } from '@backend/modules/task/model.ts'
import { redis } from '@backend/services/redis.ts'
import { status } from 'elysia'

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
}
