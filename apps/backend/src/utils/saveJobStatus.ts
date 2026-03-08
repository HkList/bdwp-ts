import type { ElysiaCustomStatusResponse } from 'elysia'
import { redis } from '@backend/services/redis.ts'

export type JobResponse<T>
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

export interface SaveJobStatusOptions<T> {
  job_id: string
  progress: number
  status: 'processing' | 'completed' | 'failed'
  message: string
  data?: T
}

export async function saveJobStatus<T extends object | null>(options: SaveJobStatusOptions<T>) {
  const { job_id, progress, status, message, data } = options

  const payload = JSON.stringify({ progress, status, message, data: data ?? {} })

  await redis.set(
    `task:${job_id}`,
    payload,
    'EX',
    3600,
  )

  // 发布任务状态更新消息，用于 SSE 推送
  await redis.publish(`task:update:${job_id}`, payload)
}
