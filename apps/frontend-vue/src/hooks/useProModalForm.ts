import type { FormRules } from '@frontend/hooks/useFormRules.ts'
import type { CreateProFormOptions } from 'pro-naive-ui'
import type { Simplify } from 'type-fest'
import type { ComputedRef, Ref } from 'vue'

import { useFormRules } from '@frontend/hooks/useFormRules.ts'
import { createProModalForm } from 'pro-naive-ui'
import { computed, ref } from 'vue'

export interface UseProModalFormOptions<T extends object, K extends object> extends Simplify<
  CreateProFormOptions<T>
> {
  rules?: () => FormRules<K>
  // 表单提交状态
  loading?: Ref<boolean>
}

export type ModifiedOpenFn<T extends unknown[]> = (...args: T) => boolean | void

export type UseProModalFormReturnType<
  T extends object,
  K extends object,
  U extends unknown[] = [],
> = ComputedRef<{
  form: ReturnType<typeof createProModalForm<T>>
  rules: FormRules<K>
  open: ModifiedOpenFn<U>
  close: () => void
  show: boolean
  loading: boolean
}>

export function useProModalForm<T extends object, K extends object = T, U extends unknown[] = []>(options: UseProModalFormOptions<T, K>, openFn?: ModifiedOpenFn<U>): UseProModalFormReturnType<T, K, U> {
  const loading = options.loading ?? ref(false)
  const form = createProModalForm<T>(options)

  const open = (...args: U) => {
    if (openFn) {
      const r = openFn(...args)
      if (r === false)
        return
    }
    form.show.value = true
  }

  return computed(() => ({
    form,
    rules: useFormRules(options.rules?.()),
    open,
    close: form.close,
    show: form.show.value,
    loading: loading.value,
  }))
}
