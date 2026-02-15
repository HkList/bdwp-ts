import {
  createDiscreteApi,
  type NotificationProviderInst,
  type MessageProviderInst,
  type DialogProviderInst,
  type LoadingBarProviderInst,
} from 'naive-ui'
import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'

let notification: NotificationProviderInst
let message: MessageProviderInst
let dialog: DialogProviderInst
let loadingBar: LoadingBarProviderInst

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
