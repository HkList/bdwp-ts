<template>
  <ProConfigProvider v-bind="proConfigProviderProps">
    <NGlobalStyle />
    <RouterView />
  </ProConfigProvider>
</template>

<script setup lang="ts">
import { proConfigProviderProps } from '@frontend/hooks/useTheme.ts'
import { NGlobalStyle } from 'naive-ui'
import { ProConfigProvider } from 'pro-naive-ui'
import { RouterView } from 'vue-router'
</script>

<style lang="scss" scoped></style>
