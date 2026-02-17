import type {
  ProSearchFormPlusReturn,
  UseProSearchFormPlusOptions,
} from '@frontend/components/ProSearchFormPlus/types.ts'
import type { Ref } from 'vue'

import { computed, ref } from 'vue'

export const useProSearchFormPlus = <T extends object>(
  options: UseProSearchFormPlusOptions<T>,
): ProSearchFormPlusReturn<T> => {
  const { columns, initValues, rules } = options

  const formValues = ref(structuredClone(initValues)) as Ref<T>
  const computedColumns = computed(() => columns())
  const computedRules = computed(() => rules?.())

  return {
    columns: computedColumns,
    formProps: computed(() => ({
      columns: computedColumns.value,
      initValues,
      'onUpdate:value': (value: T) => {
        formValues.value = value
      },
      rules: computedRules.value,
      value: formValues.value,
    })),
    formValues,
    rules: computedRules,
  }
}
