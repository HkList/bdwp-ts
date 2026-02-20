import type {
  ProSearchFormPlusColumns,
  ProSearchFormPlusProps,
} from '@frontend/components/ProSearchFormPlus/types.ts'
import type { FormRules } from '@frontend/hooks/useFormRules.ts'
import type { ComputedRef, Ref } from 'vue'

import { computed, ref } from 'vue'
import { useFormRules } from '@frontend/hooks/useFormRules.ts'

export interface UseProSearchFormPlusOptions<T extends object> {
  /** 搜索表单列配置 */
  columns: () => ProSearchFormPlusColumns<T>
  /** 初始化表单值, 重置表单时会使用 */
  initValues: T
  /** 表单验证规则 */
  rules?: () => FormRules<T>
}

export interface ProSearchFormPlusReturn<T extends object> {
  columns: ComputedRef<ProSearchFormPlusColumns<T>>
  formProps: ComputedRef<ProSearchFormPlusProps<T>>
  formValues: Ref<T>
  rules: ComputedRef<FormRules<T> | undefined>
}

export const useProSearchFormPlus = <T extends object>(
  options: UseProSearchFormPlusOptions<T>,
): ProSearchFormPlusReturn<T> => {
  const { columns, initValues, rules } = options

  const formValues = ref(structuredClone(initValues)) as Ref<T>
  const computedColumns = computed(() => columns())
  const computedRules = computed(() => useFormRules(rules?.()))

  return {
    columns: computedColumns,
    formProps: computed(() => ({
      initValues,
      value: formValues.value,
      'onUpdate:value': (value: T) => {
        formValues.value = value
      },

      columns: computedColumns.value,
      rules: computedRules.value,
    })),
    formValues,
    rules: computedRules,
  }
}
