import type { StringKeys } from '@frontend/utils/types.ts'
import type { FormItemRule } from 'naive-ui'

export type FormRules<T extends object> = {
  [K in StringKeys<T>]?: FormItemRule | FormItemRule[]
}

export function useFormRules<T extends object>(formRules: FormRules<T> = {}) {
  Object.values(formRules).forEach((rules) => {
    const ruleArray = Array.isArray(rules) ? rules : [rules]
    ruleArray.forEach(rule => (rule.trigger ??= 'blur'))
  })
  return formRules
}
