import type { FormRules } from '@frontend/components/ProSearchFormPlus/index.ts'
import type { CreateProFormOptions } from 'pro-naive-ui'
import type { Simplify } from 'type-fest'

import { createProForm } from 'pro-naive-ui'
import { computed } from 'vue'

export const useProForm = <T extends object>(
  options: Simplify<CreateProFormOptions<T>>,
  rules?: FormRules<T>,
) => ({
  form: computed(() => createProForm(options)),
  rules: computed(() => rules),
})
