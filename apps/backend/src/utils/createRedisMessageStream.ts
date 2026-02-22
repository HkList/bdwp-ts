import { on } from 'node:events'
import { redis } from '@backend/services/redis.ts'
import { isAbortError } from '@backend/utils/errorCheckers.ts'

export async function* createRedisMessageStream(
  channel: string,
  options: { timeout?: number } = {},
) {
  const { timeout = 5 * 60 * 1000 } = options

  const pool = redis.duplicate()
  await pool.connect()

  let closed = false
  const ac = new AbortController()
  const timeoutInst = setTimeout(() => ac.abort(), timeout)

  const close = async () => {
    if (closed) {
      return
    }

    closed = true
    ac.abort()
    timeoutInst.close()
    await pool.unsubscribe(channel)
    await pool.quit()
  }

  try {
    // 先监听消息再订阅，避免漏掉在订阅前发布的消息
    const messages = on(pool, 'message', { signal: ac.signal })
    await pool.subscribe(channel)

    for await (const [ch, message] of messages) {
      if (ch !== channel) {
        continue
      }

      // 每次收到消息重置超时时间
      if (timeoutInst) {
        timeoutInst.refresh()
      }

      yield {
        message,
        close,
      }
    }
  }
  catch (error) {
    // 如果是主动关闭导致的超市错误，不抛出
    if (!(closed && isAbortError(error))) {
      throw error
    }
  }
  finally {
    await close()
  }
}
