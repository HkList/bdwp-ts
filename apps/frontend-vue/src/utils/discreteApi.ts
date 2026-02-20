import type {
  DialogProviderInst,
  LoadingBarProviderInst,
  MessageProviderInst,
  NotificationProviderInst,
} from 'naive-ui'

import { configProviderProps } from '@frontend/hooks/useTheme.ts'
import { createDiscreteApi } from 'naive-ui'

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
