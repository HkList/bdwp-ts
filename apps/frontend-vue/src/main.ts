import App from '@frontend/App.vue'
import { useRouteTabs } from '@frontend/hooks/useRouteTabs.ts'
import { router } from '@frontend/router/index.ts'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import '@frontend/assets/css/index.scss'

useRouteTabs(router, path => path.startsWith('/admin'))

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
