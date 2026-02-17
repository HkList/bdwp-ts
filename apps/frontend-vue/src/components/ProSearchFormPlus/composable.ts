import { computed, ref, type Ref } from 'vue'
import type {
  ProSearchFormPlusReturn,
  UseProSearchFormPlusOptions,
} from '@frontend/components/ProSearchFormPlus/types'

export const useProSearchFormPlus = <T extends object>(
  options: UseProSearchFormPlusOptions<T>,
): ProSearchFormPlusReturn<T> => {
  const { initValues, columns, rules } = options

  const formValues = ref(structuredClone(initValues)) as Ref<T>
  const computedColumns = computed(() => columns())
  const computedRules = computed(() => rules?.())

  return {
    formValues,
    columns: computedColumns,
    rules: computedRules,
    formProps: computed(() => ({
      initValues,
      columns: computedColumns.value,
      rules: computedRules.value,
      value: formValues.value,
      'onUpdate:value': (value: T) => {
        formValues.value = value
      },
    })),
  }
}
