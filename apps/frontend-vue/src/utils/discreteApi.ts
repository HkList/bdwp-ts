import { configProviderProps } from '@frontend/hooks/useTheme.ts'
import { createDiscreteApi } from 'naive-ui'

const { notification, message, dialog, loadingBar, modal } = createDiscreteApi(['notification', 'message', 'dialog', 'loadingBar', 'modal'], {
  configProviderProps,
})

export { dialog, loadingBar, message, modal, notification }
