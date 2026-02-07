import { treaty } from '@elysiajs/eden'
import type { App } from '@backend/elysia'
import { useUserStore } from '@frontend/stores/user.ts'

export const api = treaty<App>(`${window?.location?.origin}/api`, {
  headers(path) {
    if (path.startsWith('admin')) {
      const { token } = useUserStore()

      return {
        authorization: `Bearer ${token}`,
      }
    }
  },
  async onResponse(response) {
    const json = await response.clone().json()
    if (['未提供令牌', '令牌无效', '令牌对应用户不存在'].includes(json.message)) {
      // const toast = useToast()
      // toast.add({
      //   title: '身份验证失败',
      //   description: '正在为您跳转到登陆页面...',
      //   color: 'error',
      // })
      // setTimeout(() => {
      //   navigateTo('/admin/login')
      // }, 2000)
    }
  },
}).api
