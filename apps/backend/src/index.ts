import process from 'node:process'
import { initElysia } from '@backend/services/elysia.ts'
import { initExceptionHandler } from '@backend/services/exceptionHandler.ts'
import { initRedis } from '@backend/services/redis.ts'

try {
  (async () => {
    initExceptionHandler()
    await initRedis()
    await initElysia()
  })()
}
catch (error) {
  console.error('Error during initialization:', error)
  process.exit(1)
}
