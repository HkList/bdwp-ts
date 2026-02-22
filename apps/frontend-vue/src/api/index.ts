import type { App } from '@backend/elysia'

import { treaty } from '@elysiajs/eden'
import { router } from '@frontend/router/index.ts'
import { useAuthStore } from '@frontend/stores/authStore.ts'
import { loadingBar, notification } from '@frontend/utils/discreteApi.ts'
import { sleep } from '@frontend/utils/sleep.ts'

export const DO_NOT_SHOWN_MESSAGE = ['获取任务状态成功']

export async function retryFetch(url: string, options?: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  try {
    const response = await fetch(url, options)

    // 仅在服务器错误时重试
    if (!response.ok && response.status === 500 && retries > 0) {
      if (import.meta.env.DEV)
        console.warn(`请求失败，正在重试... (${retries} 次剩余)`)

      await sleep(delay)
      return retryFetch(url, options, retries - 1, delay)
    }

    return response
  }
  catch (error) {
    if (retries > 0) {
      if (import.meta.env.DEV)
        console.warn(`请求错误，正在重试... (${retries} 次剩余)`, error)

      await sleep(delay)
      return retryFetch(url, options, retries - 1, delay)
    }

    throw error
  }
}

export const api = treaty<App>(window?.location?.origin, {
  parseDate: false,
  fetcher: retryFetch as typeof fetch,
  headers(path) {
    if (path.startsWith('/api/admin') || path === '/api/auth/sign_out') {
      const { token } = useAuthStore()

      return {
        authorization: `Bearer ${token}`,
      }
    }
  },
  async onRequest() {
    loadingBar.start()
  },
  async onResponse(response) {
    let json: {
      message: string
      data?: unknown
    }

    // 不处理 SSE 响应
    if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
      return
    }

    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      loadingBar.error()

      notification.error({
        duration: 3000,
        title: '服务器响应格式错误',
        content: `HTTP ${response.status}: ${response.statusText}`,
      })

      return
    }

    try {
      json = await response.clone().json()
    }
    catch {
      loadingBar.error()
      notification.error({
        duration: 3000,
        title: 'JSON 解析失败',
        content: `HTTP ${response.status}: ${response.statusText}`,
      })

      return
    }

    if (response.ok) {
      loadingBar.finish()

      if (!DO_NOT_SHOWN_MESSAGE.includes(json.message)) {
        notification.success({
          duration: 1000,
          title: json.message,
        })
      }
    }
    else {
      loadingBar.error()

      if (['令牌对应用户不存在', '令牌无效', '未提供令牌'].includes(json.message)) {
        notification.error({
          content: '正在为您跳转到登陆页面...',
          duration: 3000,
          title: json.message,
        })

        setTimeout(async () => {
          const authStore = useAuthStore()
          authStore.setToken(null)

          await router.push('/sign_in')
        }, 1000)

        return
      }

      notification.error({
        duration: 3000,
        title: json.message,
      })
    }
  },
}).api
