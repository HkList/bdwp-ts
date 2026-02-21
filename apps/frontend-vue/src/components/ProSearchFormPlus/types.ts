import type { FormRules } from '@frontend/hooks/useFormRules.ts'
import type { StringKeys } from '@frontend/utils/types.ts'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface.d.ts'
import type { ProButtonProps } from 'pro-naive-ui'
import type { VNode } from 'vue'

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
  | { multiple?: boolean, options: SelectMixedOption[], type: 'select' }
  | { type: 'date' }
  | { type: 'number' }
  | { type?: 'string' | undefined }
)

export type ProSearchFormPlusColumns<T extends object> = {
  [K in StringKeys<T>]: ProSearchFormPlusColumn<T, K>
}[StringKeys<T>][]

export interface ProSearchFormPlusProps<T extends object> {
  /** 搜索表单列配置 */
  'columns': ProSearchFormPlusColumns<T>
  /** 初始化表单值, 重置表单时会使用 */
  'initValues': T
  /** 搜索表单标题 */
  'title'?: string
  /** 表单验证规则 */
  'rules'?: FormRules<T>
  /** 自定义重置按钮属性 */
  'resetButtonProps'?: ProButtonProps
  /** 自定义搜索按钮属性 */
  'searchButtonProps'?: ProButtonProps
  /** 是否隐藏重置按钮 */
  'hideResetButton'?: boolean
  /** 是否隐藏搜索按钮 */
  'hideSearchButton'?: boolean

  /** 重置事件回调 */
  'onReset'?: () => void
  /** 搜索事件回调 */
  'onSearch'?: () => void

  /** 绑定 v-model 属性 */
  'value': T
  'onUpdate:value': (value: T) => void
}
