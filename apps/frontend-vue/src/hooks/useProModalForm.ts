import type { Simplify } from 'type-fest'
import type { CreateProFormOptions } from 'pro-naive-ui'
import type { FormRules } from '@frontend/hooks/useFormRules.ts'
import type { Ref } from 'vue'

import { createProModalForm } from 'pro-naive-ui'
import { computed, ref } from 'vue'
import { useFormRules } from '@frontend/hooks/useFormRules.ts'

export interface UseProModalFormOptions<T extends object> extends Simplify<
  CreateProFormOptions<T>
> {
  rules?: () => FormRules<T>
  // 默认为 true，提交成功后自动关闭 Modal
  closeModalAfterSuccessSubmit?: boolean
  // 表单提交状态
  loading?: Ref<boolean>
}

export const useProModalForm = <T extends object>(options: UseProModalFormOptions<T>) => {
  const loading = options.loading ?? ref(false)

  const form = createProModalForm<T>({
    ...options,
    ...(options.closeModalAfterSuccessSubmit === false
      ? {}
      : {
          onSubmit: async (values, warnings) => {
            loading.value = true

            try {
              options.onSubmit?.(values, warnings)
              form.close()
            } finally {
              loading.value = false
            }
          },
        }),
  })

  return computed(() => ({
    form,
    rules: useFormRules(options.rules?.()),
    open: form.open,
    close: form.close,
    show: form.show.value,
    loading: loading.value,
  }))
}
