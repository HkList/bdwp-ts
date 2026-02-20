import type { App } from '@backend/elysia'

import { treaty } from '@elysiajs/eden'
import { router } from '@frontend/router/index.ts'
import { useAuthStore } from '@frontend/stores/authStore.ts'
import { loadingBar, notification } from '@frontend/utils/discreteApi.ts'

export const DO_NOT_SHOWN_MESSAGE = ['获取任务状态成功']

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

      if (!DO_NOT_SHOWN_MESSAGE.includes(json.message)) {
        notification.success({
          duration: 1000,
          title: json.message,
        })
      }
    } else {
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
