import type { FormRules } from '@frontend/hooks/useFormRules.ts'
import type { CreateProFormOptions } from 'pro-naive-ui'
import type { Simplify } from 'type-fest'

import { useFormRules } from '@frontend/hooks/useFormRules.ts'
import { createProForm } from 'pro-naive-ui'
import { computed } from 'vue'

export interface UseProFormOptions<T extends object> extends Simplify<CreateProFormOptions<T>> {
  rules?: () => FormRules<T>
}

export function useProForm<T extends object>(options: UseProFormOptions<T>) {
  return computed(() => ({
    form: createProForm<T>(options),
    rules: useFormRules(options.rules?.()),
  }))
}
