import { initElysia } from '@backend/services/elysia.ts'
import { initExceptionHandler } from '@backend/services/exceptionHandler.ts'
import { initRedis } from '@backend/services/redis.ts'

initExceptionHandler()
await initRedis()
await initElysia()
