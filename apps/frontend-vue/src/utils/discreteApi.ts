import { configProviderProps } from '@frontend/hooks/useTheme.ts'
import { createDiscreteApi } from 'naive-ui'

const { notification, message, dialog, loadingBar } = createDiscreteApi(['notification', 'message', 'dialog', 'loadingBar'], {
  configProviderProps,
})

export { dialog, loadingBar, message, notification }
