import { treaty } from '@elysiajs/eden'
import type { App } from '@backend/elysia'
import { useAuthStore } from '@frontend/stores/authStore'
import { loadingBar, notification } from '@frontend/utils/discreteApi'
import { router } from '@frontend/router'

export const api = treaty<App>(`${window?.location?.origin}`, {
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
    const json = await response.clone().json()

    if (response.ok) {
      loadingBar.finish()

      notification.success({
        title: json.message,
        duration: 1000,
      })
    } else {
      loadingBar.error()

      if (['未提供令牌', '令牌无效', '令牌对应用户不存在'].includes(json.message)) {
        notification.error({
          title: json.message,
          content: '正在为您跳转到登陆页面...',
          duration: 3000,
        })

        setTimeout(() => {
          const authStore = useAuthStore()
          authStore.setToken(null)

          router.push('/sign_in')
        }, 1000)
        return
      }

      notification.error({
        title: json.message,
        duration: 3000,
      })
    }
  },
}).api

export * from '@frontend/api/client'
