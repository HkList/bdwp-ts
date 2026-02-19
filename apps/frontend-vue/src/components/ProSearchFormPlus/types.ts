import type { StringKeys } from '@frontend/utils/types.ts'
import type { FormItemRule } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import type { ProButtonProps } from 'pro-naive-ui'
import type { ComputedRef, Ref, VNode } from 'vue'

export type FormRules<T extends object> = {
  [K in StringKeys<T>]?: FormItemRule | FormItemRule[]
}

// 搜索表单列配置项
export type ProSearchFormPlusColumn<T extends object, K extends StringKeys<T> = StringKeys<T>> = {
  /** 字段路径，必须是字符串类型的 key */
  key: K
  /** 占位符 */
  placeholder?: string
  /** 自定义渲染函数 - 返回 VNode */
  render?: (value: T[K]) => VNode
  /** 显示的标题 */
  title: string
} & (
  | { multiple?: boolean; options: SelectMixedOption[]; type: 'select' }
  | { type: 'date' }
  | { type: 'number' }
  | { type?: 'string' | undefined }
)

export type ProSearchFormPlusColumns<T extends object> = {
  [K in StringKeys<T>]: ProSearchFormPlusColumn<T, K>
}[StringKeys<T>][]

export interface ProSearchFormPlusProps<T extends object> {
  /** 搜索表单列配置 */
  columns: ProSearchFormPlusColumns<T>
  /** 是否隐藏重置按钮 */
  hideResetButton?: boolean
  /** 是否隐藏搜索按钮 */
  hideSearchButton?: boolean
  /** 初始化表单值, 重置表单时会使用 */
  initValues: T
  /** 重置事件回调 */
  onReset?: () => void
  /** 搜索事件回调 */
  onSearch?: () => void
  'onUpdate:value': (value: T) => void
  /** 自定义重置按钮属性 */
  resetButtonProps?: ProButtonProps

  /** 表单验证规则 */
  rules?: FormRules<T>
  /** 自定义搜索按钮属性 */
  searchButtonProps?: ProButtonProps
  /** 搜索表单标题 */
  title?: string
  /** 绑定 v-model 属性 */
  value: T
}

export interface ProSearchFormPlusReturn<T extends object> {
  columns: ComputedRef<ProSearchFormPlusColumns<T>>
  formProps: ComputedRef<ProSearchFormPlusProps<T>>
  formValues: Ref<T>
  rules: ComputedRef<FormRules<T> | undefined>
}

export interface UseProSearchFormPlusOptions<T extends object> {
  /** 搜索表单列配置 */
  columns: () => ProSearchFormPlusColumns<T>
  /** 初始化表单值, 重置表单时会使用 */
  initValues: T
  /** 表单验证规则 */
  rules?: () => FormRules<T>
}
