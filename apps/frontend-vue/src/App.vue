<template>
  <ProConfigProvider v-bind="configProviderProps">
    <NGlobalStyle />
    <RouterView />
  </ProConfigProvider>
</template>

<script setup lang="ts">
import { configProviderProps } from '@frontend/components/ThemeSwitcher/index.ts'
import { NGlobalStyle } from 'naive-ui'
import { ProConfigProvider } from 'pro-naive-ui'
import { RouterView } from 'vue-router'
</script>

<style lang="scss" scoped></style>
