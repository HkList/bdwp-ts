<template>
  <ProConfigProvider v-bind="configProviderProps">
    <NGlobalStyle />
    <RouterView />
  </ProConfigProvider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NGlobalStyle } from 'naive-ui'
import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'
import { ProConfigProvider } from 'pro-naive-ui'
</script>

<style lang="scss" scoped></style>
