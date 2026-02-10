import { createDiscreteApi } from 'naive-ui'
import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'

let notification: ReturnType<typeof createDiscreteApi>['notification']
let message: ReturnType<typeof createDiscreteApi>['message']
let dialog: ReturnType<typeof createDiscreteApi>['dialog']
let loadingBar: ReturnType<typeof createDiscreteApi>['loadingBar']

export function setupDiscreteApi() {
  const discreteApi = createDiscreteApi(['notification', 'message', 'dialog', 'loadingBar'], {
    configProviderProps,
  })
  notification = discreteApi.notification
  message = discreteApi.message
  dialog = discreteApi.dialog
  loadingBar = discreteApi.loadingBar
}

export { notification, message, dialog, loadingBar }
