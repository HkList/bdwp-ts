import { config } from '@backend/config.ts'
import { Redis } from 'ioredis'

export const redis = new Redis({
  host: config.REDIS_HOST,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  db: config.REDIS_DB,
})

export async function initRedis() {
  await redis.connect()
  console.log('🧠 Redis连接成功!')
}
