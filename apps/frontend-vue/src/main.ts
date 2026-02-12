import '@frontend/assets/css/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@frontend/App.vue'
import { router } from '@frontend/router/index.ts'
import { setupDiscreteApi } from '@frontend/utils/discreteApi.ts'
import { setupRouteTabs } from '@frontend/utils/useRouteTabs.ts'

setupDiscreteApi()
setupRouteTabs(router, (path) => path.startsWith('/admin'))

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
