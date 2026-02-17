<template>
  <ProForm v-bind="attrs">
    <slot />
  </ProForm>
</template>

<script lang="ts" setup>
import type { ProFormProps } from 'pro-naive-ui'

import { ProForm } from 'pro-naive-ui'

const attrs = withDefaults(defineProps<ProFormProps>(), {
  labelPlacement: 'left',
  showFeedback: true,
  showLabel: true,
  showRequireMark: true,
})
</script>
