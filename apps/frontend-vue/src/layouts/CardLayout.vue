<script lang="ts" setup>
import { ThemeSwitcher } from '@frontend/components/ThemeSwitcher/index.ts'
import { NCard } from 'naive-ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <NCard class="cardLayout">
    <template #header>
      <ThemeSwitcher />
    </template>

    <RouterView />
  </NCard>
</template>

<style lang="scss" scoped>
.cardLayout {
  width: 35%;
  margin: 100px auto;
  min-height: 70vh;
  max-height: 90vh;
  position: relative;
  overflow: auto;

  @media (max-width: 1250px) {
    width: 50%;
  }

  @media (max-width: 1024px) {
    width: 80%;
  }

  :deep(.n-card-header) {
    position: absolute;
    right: 0;
    z-index: 9999;
  }

  :deep(.n-card__content) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
}
</style>
