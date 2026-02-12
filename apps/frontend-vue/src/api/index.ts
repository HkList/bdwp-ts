import { treaty } from '@elysiajs/eden'
import type { App } from '@backend/elysia'
import { useUserStore } from '@frontend/stores/userStore'
import { router } from '@frontend/router/index.ts'
import { loadingBar, notification } from '@frontend/utils/discreteApi.ts'

export const api = treaty<App>(`${window?.location?.origin}`, {
  headers(path) {
    if (path.startsWith('admin') || path === '/api/auth/sign_out') {
      const { token } = useUserStore()

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
        duration: 3000,
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

export * from '@frontend/api/client.ts'
