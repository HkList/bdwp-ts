import type { StringKeys } from '@frontend/utils/types'
import type { FormItemRule, SelectOption } from 'naive-ui'
import type { ProButtonProps } from 'pro-naive-ui'
import { computed, type ComputedRef, type VNode } from 'vue'

// 搜索表单列配置项
export type ProSearchFormPlusColumn<T extends object, K extends StringKeys<T> = StringKeys<T>> = {
  /** 显示的标题 */
  title: string
  /** 字段路径，必须是字符串类型的 key */
  key: K
  /** 占位符 */
  placeholder?: string
  /** 自定义渲染函数 - 返回 VNode */
  render?: (value: T[K]) => VNode
} & (
  | { type?: 'string' | undefined }
  | { type: 'number' }
  | { type: 'select'; selectOptions: SelectOption[] }
  | { type: 'date' }
)

export type ProSearchFormPlusColumns<T extends object> = {
  [K in StringKeys<T>]: ProSearchFormPlusColumn<T, K>
}[StringKeys<T>][]

export type FormRules<T extends object> = {
  [K in StringKeys<T>]?: FormItemRule | FormItemRule[]
}

export interface ProSearchFormPlusProps<T extends object> {
  /** 搜索表单列配置 */
  columns: ProSearchFormPlusColumns<T>
  /** 搜索表单标题 */
  title?: string
  /** 表单验证规则 */
  rules?: FormRules<T>
  /** 是否隐藏重置按钮 */
  hideResetButton?: boolean
  /** 是否隐藏搜索按钮 */
  hideSearchButton?: boolean
  /** 自定义搜索按钮属性 */
  searchButtonProps?: ProButtonProps
  /** 自定义重置按钮属性 */
  resetButtonProps?: ProButtonProps
}

export interface ProSearchFormPlusReturn<T extends object> {
  columns: ComputedRef<ProSearchFormPlusColumns<T>>
  rules: ComputedRef<FormRules<T> | undefined>
}

export const useProSearchFormPlus = <T extends object>(
  columns: ProSearchFormPlusColumns<T>,
  rules?: FormRules<T>,
): ProSearchFormPlusReturn<T> => {
  return {
    columns: computed(() => columns),
    rules: computed(() => rules),
  }
}
export { default as ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus/ProSearchFormPlus.vue'
