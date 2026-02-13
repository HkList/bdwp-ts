import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, ref, type ComputedRef, type Ref, type VNode } from 'vue'

// 搜索表单列配置项
export type SearchFormColumn<T extends object, K extends keyof T> = {
  /** 显示的标题 */
  title: string
  /** 字段路径，支持嵌套路径如 'user.name' */
  key: K
  /** 是否必填 */
  required?: boolean
  /** 占位符 */
  placeholder?: string
  /** 自定义渲染函数 */
  render?: (item: T[K]) => VNode
} & (
  | { type?: 'text' | undefined }
  | { type: 'number' }
  | { type: 'select'; selectOptions: SelectMixedOption[] }
  | { type: 'date' }
)

export type SearchFormColumns<T extends object, K extends keyof T = keyof T> = SearchFormColumn<
  T,
  K
>[]

export const defineColumns = <T extends object>(
  factory: () => { [K in keyof T]: SearchFormColumn<T, K> }[keyof T][],
): {
  modelValue: Ref<T>
  columns: ComputedRef<SearchFormColumns<T>>
} => {
  const columns = computed(() => factory())
  const modelValue = ref({}) as Ref<T>
  columns.value.forEach((column) => {
    modelValue.value[column.key] = undefined as T[typeof column.key]
  })

  return {
    modelValue,
    columns,
  }
}

// 组件 Props 类型
export interface NSearchFormProps<T extends object> {
  /** 搜索表单列配置 */
  columns: SearchFormColumns<T>
  /** 是否显示重置按钮 */
  hideReset?: boolean
  /** 是否显示搜索按钮 */
  hideSubmit?: boolean
  /** 是否可折叠 */
  disableCollapse?: boolean
}

export { default as NSearchForm } from '@frontend/components/NSearchForm/NSearchForm.vue'
