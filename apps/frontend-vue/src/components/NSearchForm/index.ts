import type { StringKeys } from '@frontend/utils/types.ts'
import type { FormItemRule } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, type ComputedRef, type VNode, type Component } from 'vue'

// 搜索表单列配置项
export type SearchFormColumn<T extends object, K extends StringKeys<T> = StringKeys<T>> = {
  /** 显示的标题 */
  title: string
  /** 字段路径，必须是字符串类型的 key */
  key: K
  /** 占位符 */
  placeholder?: string
  /** 自定义渲染函数 - 返回 VNode 或组件 */
  render?: (value: T[K]) => VNode | Component
} & (
  | { type?: 'string' | undefined }
  | { type: 'number' }
  | { type: 'select'; selectOptions: SelectMixedOption[] }
  | { type: 'date' }
)

export type SearchFormColumns<T extends object> = {
  [K in StringKeys<T>]: SearchFormColumn<T, K>
}[StringKeys<T>][]

export type SearchFormRules<T extends object> = {
  [K in StringKeys<T>]: FormItemRule | FormItemRule[]
}

// 组件 Props 类型
export interface NSearchFormProps<T extends object> {
  /** 搜索表单列配置 */
  columns: SearchFormColumns<T>
  /** 表单验证规则 - 可选的部分规则 */
  rules?: SearchFormRules<T>
  /** 是否隐藏重置按钮 */
  hideResetButton?: boolean
  /** 是否隐藏搜索按钮 */
  hideSearchButton?: boolean
  /** 是否隐藏折叠按钮 */
  hideCollapseButton?: boolean
}

export type NSearchFormConfig<T extends object> = {
  columns: ComputedRef<SearchFormColumns<T>>
  rules: ComputedRef<SearchFormRules<T> | undefined>
}

export const useNSearchFormConfig = <T extends object>(
  columns: SearchFormColumns<T>,
  rules?: SearchFormRules<T>,
): NSearchFormConfig<T> => ({
  columns: computed(() => columns),
  rules: computed(() => rules),
})

export { default as NSearchForm } from '@frontend/components/NSearchForm/NSearchForm.vue'
