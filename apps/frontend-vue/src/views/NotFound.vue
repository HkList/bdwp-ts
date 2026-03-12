<script lang="ts" setup>
import { NButton, NFlex, NResult } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = async () => await router.push('/')
const goBack = async () => router.back()
</script>

<template>
  <NResult status="404" title="页面走丢了" description="你访问的页面不存在或已被移除">
    <template #footer>
      <NFlex justify="center">
        <NButton type="success" @click="goHome">
          返回首页
        </NButton>
        <NButton type="info" @click="goBack">
          返回上一页
        </NButton>
      </NFlex>
    </template>
  </NResult>
</template>

<style lang="scss" scoped></style>
