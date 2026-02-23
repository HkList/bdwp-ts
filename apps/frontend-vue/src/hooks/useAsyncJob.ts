import { api } from '@frontend/api/index.ts'
import { notification } from '@frontend/utils/discreteApi.ts'
import { NSpin } from 'naive-ui'
import { h } from 'vue'

const NOTIFICATION_DURATION = 3000

interface AsyncJobOptions {
  task_id: string
}

interface AsyncJobApiResult<T> {
  status: 'processing' | 'completed' | 'failed'
  message: string
  data: T
  progress: number
}

export type AsyncJobResult<T> = Omit<AsyncJobApiResult<T>, 'status'> & {
  status: 'completed' | 'failed'
}

function showErrorNotification(title: string, content: string, error?: unknown): never {
  notification.error({
    duration: NOTIFICATION_DURATION,
    title,
    content,
  })

  throw error instanceof Error ? error : new Error(content)
}

export async function useAsyncJob<T>(
  options: AsyncJobOptions,
): Promise<AsyncJobResult<T>> {
  const { task_id } = options

  const response = await api.task.sse.get({ query: { task_id } })

  if (response.error) {
    showErrorNotification(
      '订阅任务状态失败',
      `HTTP ${response.status}: ${response.response.statusText}`,
      response.error,
    )
  }

  const notificationLoading = notification.create({
    title: '正在处理，请稍候...',
    duration: 0,
    avatar: () => h(NSpin),
  })

  for await (const res of response.data) {
    if (res.event === 'error') {
      showErrorNotification('获取任务状态失败', res.data.message)
    }

    if (res.event === 'message') {
      const result = res.data as AsyncJobApiResult<T>

      notificationLoading.content = () => {
        return h('div', { style: { display: 'flex', flexDirection: 'column' } }, [
          h('div', `进度: ${result.progress}%`),
          h('div', `消息: ${result.message}`),
        ])
      }

      if (result.status !== 'processing') {
        notificationLoading.destroy()
        return result as AsyncJobResult<T>
      }
    }
  }

  showErrorNotification(
    '任务订阅意外结束',
    '任务订阅连接意外关闭，可能导致无法获取最终结果',
  )
}
