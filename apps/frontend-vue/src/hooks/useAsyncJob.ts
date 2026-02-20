import { api } from '@frontend/api/index.ts'

export interface UseAsyncJobOptions {
  taskId: string
  /** 轮询间隔，单位毫秒，默认为2000ms */
  pollingInterval?: number
}

export type AsyncJobResultType<T> = {
  status: 'completed' | 'failed'
  message: string
  data: T
  progress: number
}

export const useAsyncJob = <T>(options: UseAsyncJobOptions) => {
  const { taskId, pollingInterval = import.meta.env.DEV ? 100 : 2000 } = options

  return new Promise<AsyncJobResultType<T>>((resolve, reject) => {
    const pollJobStatus = async () => {
      try {
        const res = await api.task.get({ query: { task_id: taskId } })
        if (res.error) return reject(res.error)

        if (import.meta.env.DEV) {
          console.log('轮询任务状态:', res.data)
        }

        if (res.data.data.status !== 'processing') {
          resolve(res.data.data as AsyncJobResultType<T>)
        } else {
          setTimeout(pollJobStatus, pollingInterval)
        }
      } catch (err) {
        reject(err)
      }
    }

    // 开始轮询
    pollJobStatus()
  })
}
