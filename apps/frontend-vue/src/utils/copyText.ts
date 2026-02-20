import { notification } from '@frontend/utils/discreteApi.ts'

export const copyText = (text: string, message = '复制成功') => {
  try {
    navigator.clipboard.writeText(text)
  } catch {
    // 使用兼容方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  notification.success({
    title: message,
    duration: 1000,
  })
}
