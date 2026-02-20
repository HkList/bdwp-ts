import type { FormItemRule } from 'naive-ui'
import type { StringKeys } from '@frontend/utils/types.ts'

export type FormRules<T extends object> = {
  [K in StringKeys<T>]?: FormItemRule | FormItemRule[]
}

export const useFormRules = <T extends object>(formRules: FormRules<T> = {}) => {
  Object.values(formRules).forEach((rules) => {
    const ruleArray = Array.isArray(rules) ? rules : [rules]
    ruleArray.forEach((rule) => (rule.trigger ??= 'blur'))
  })
  return formRules
}
