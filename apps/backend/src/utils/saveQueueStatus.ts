import type { Job } from 'bullmq'
import type { ElysiaCustomStatusResponse } from 'elysia'
import { redis } from '@backend/services/redis.ts'

export type QueueResponse<T extends object>
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: string
      data: T
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export interface SaveQueueStatusOptions<T extends object> {
  job: Job
  progress: number
  status: 'processing' | 'completed' | 'failed'
  message: string
  data?: T | null
}

export async function saveQueueStatus<T extends object>(options: SaveQueueStatusOptions<T>) {
  const { job, progress, status, message, data } = options

  const payload = JSON.stringify({ progress, status, message, data: data ?? {} })

  await redis.set(
    `task:${job.id}`,
    payload,
    'EX',
    3600,
  )

  // 发布任务状态更新消息，用于 SSE 推送
  await redis.publish(`task:update:${job.id}`, payload)
}
