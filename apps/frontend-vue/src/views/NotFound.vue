<template>
  <NCard class="notFound">
    <template #header>
      <ThemeSwitcher />
    </template>

    <NResult status="404" title="页面走丢了" description="你访问的页面不存在或已被移除">
      <template #footer>
        <NFlex justify="center">
          <NButton type="success" @click="goHome">返回首页</NButton>
          <NButton type="info" @click="goBack">返回上一页</NButton>
        </NFlex>
      </template>
    </NResult>
  </NCard>
</template>

<script lang="ts" setup>
import { ThemeSwitcher } from '@frontend/components/ThemeSwitcher/index.ts'
import { NButton, NCard, NFlex, NResult } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = async () => await router.push('/')
const goBack = async () => router.back()
</script>

<style lang="scss" scoped>
.notFound {
  min-height: 50vh;
  width: 30%;
  position: relative;

  :deep(.n-card-header) {
    position: absolute;
    right: 0;
  }

  :deep(.n-card__content) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
