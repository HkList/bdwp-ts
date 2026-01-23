import process from 'node:process'
import { app } from '@backend/services/elysia.ts'

export function initExceptionHandler() {
  const signals = ['SIGINT', 'SIGTERM']

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`接收到 ${signal} 信号，正在关闭...`)

      if (app.server?.url.origin) {
        await app.stop()
      }

      process.exit(0)
    })
  }

  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常', error)
  })

  process.on('unhandledRejection', (error) => {
    console.error('未处理的Promise拒绝', error)
  })
}
