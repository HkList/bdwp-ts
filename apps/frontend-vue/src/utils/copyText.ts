import { notification } from '@frontend/utils/discreteApi.ts'
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard({ legacy: true })

export async function copyText(text: string, message = '复制成功') {
  try {
    await copy(text)
  }
  catch {
    notification.error({
      title: '复制失败',
      duration: 1000,
    })
    return
  }

  notification.success({
    title: message,
    duration: 1000,
  })
}
