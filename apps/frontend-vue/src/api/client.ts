import { ref, type Ref } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

export interface UseRequestOptions {
  /** 防抖延迟（毫秒） */
  debounceWait?: number
  /** 节流延迟（毫秒） */
  throttleWait?: number
}

export interface UseRequestResult<TData, TParams extends unknown[]> {
  /** 加载状态 */
  loading: Ref<boolean>
  /** 响应数据 */
  data: Ref<TData | undefined>
  /** 错误信息 */
  error: Ref<Error | undefined>
  /** 执行请求 */
  send: (...params: TParams) => Promise<TData>
  /** 重置状态 */
  reset: () => void
}

/**
 * 通用请求 hook
 * @param service 请求函数
 * @param options 配置选项
 */
export function useRequest<TData, TParams extends unknown[]>(
  service: (...args: TParams) => Promise<TData>,
  options: UseRequestOptions = {},
): UseRequestResult<TData, TParams> {
  const { debounceWait, throttleWait } = options

  const loading = ref(false)
  const data = ref<TData>()
  const error = ref<Error>()

  const reset = () => {
    loading.value = false
    data.value = undefined
    error.value = undefined
  }

  const executeRequest = async (...params: TParams): Promise<TData> => {
    loading.value = true
    error.value = undefined

    try {
      const result = await service(...params)
      data.value = result
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      throw errorObj
    } finally {
      loading.value = false
    }
  }

  // 创建防抖或节流版本
  let send: (...params: TParams) => Promise<TData>
  if (debounceWait !== undefined) {
    send = useDebounceFn(executeRequest, debounceWait)
  } else if (throttleWait !== undefined) {
    send = useThrottleFn(executeRequest, throttleWait)
  } else {
    send = executeRequest
  }

  return {
    loading,
    data,
    error,
    send,
    reset,
  }
}
