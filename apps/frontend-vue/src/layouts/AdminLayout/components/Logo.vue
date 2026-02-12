<template>
  <div quaternary class="logo" :class="props.showBorder ? 'border' : ''">
    <NButton quaternary class="button">
      <img src="/favicon.ico" alt="Logo" class="logo-img" />
    </NButton>
    <span v-if="props.showText" class="logo-text">BDWP-ts</span>
  </div>
</template>

<script lang="ts" setup>
import { NButton } from 'naive-ui'

const props = defineProps<{
  showText: boolean
  showBorder?: boolean
}>()
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  .button:focus,
  .button:hover {
    background-color: transparent;
  }

  &.border {
    border-bottom: 1px solid var(--n-border-color);
  }

  .logo-img {
    height: 32px;
    width: 32px;
  }

  .logo-text {
    min-width: 82px;
    font-size: 18px;
    font-weight: 600;
  }
}
</style>
