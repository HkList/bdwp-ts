import { redis } from '@backend/services/redis.ts'
import { Verrou } from '@verrou/core'
import { memoryStore } from '@verrou/core/drivers/memory'
import { redisStore } from '@verrou/core/drivers/redis'

export const verrou = new Verrou({
  default: 'redis',
  stores: {
    redis: { driver: redisStore({ connection: redis }) },
    memory: { driver: memoryStore() },
  },
})
