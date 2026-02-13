<template>
  <NConfigProvider v-bind="configProviderProps">
    <NGlobalStyle />
    <RouterView />
  </NConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NGlobalStyle, NConfigProvider } from 'naive-ui'
import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'
</script>

<style lang="scss" scoped></style>
