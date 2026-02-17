import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'
import {
  createDiscreteApi,
  type DialogProviderInst,
  type LoadingBarProviderInst,
  type MessageProviderInst,
  type NotificationProviderInst,
} from 'naive-ui'

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

export { dialog, loadingBar, message, notification }
