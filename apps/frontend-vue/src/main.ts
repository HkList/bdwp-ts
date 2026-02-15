import '@frontend/assets/css/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@frontend/App.vue'
import { router } from '@frontend/router'
import { setupDiscreteApi } from '@frontend/utils/discreteApi'
import { setupRouteTabs } from '@frontend/utils/useRouteTabs'

setupDiscreteApi()
setupRouteTabs(router, (path) => path.startsWith('/admin'))

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// 应用挂载完成后隐藏加载动画
requestAnimationFrame(() => {
  const loadingElement = document.getElementById('app-loading')
  if (loadingElement) {
    loadingElement.classList.add('loaded')
    // 动画结束后移除元素
    setTimeout(() => {
      loadingElement.remove()
    }, 300)
  }
})
