<script setup lang="ts">
import { proConfigProviderProps } from '@frontend/hooks/useTheme.ts'
import { NGlobalStyle } from 'naive-ui'
import { ProConfigProvider } from 'pro-naive-ui'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
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
})
</script>

<template>
  <ProConfigProvider v-bind="proConfigProviderProps">
    <NGlobalStyle />
    <RouterView />
  </ProConfigProvider>
</template>

<style lang="scss" scoped></style>
