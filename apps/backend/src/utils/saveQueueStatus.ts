import type { Job } from 'bullmq'
import type { ElysiaCustomStatusResponse } from 'elysia'
import { redis } from '@backend/services/redis.ts'

export type QueueResponse<T extends object> =
  | ElysiaCustomStatusResponse<
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

  await redis.set(
    `task:${job.id}`,
    JSON.stringify({ progress, status, message, data: data ?? {} }),
    'EX',
    3600,
  )
}
