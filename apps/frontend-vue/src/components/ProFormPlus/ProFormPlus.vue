<template>
  <ProForm v-bind="attrs">
    <slot />
  </ProForm>
</template>

<script lang="ts" setup>
import { ProForm, type ProFormProps } from 'pro-naive-ui'

const attrs = withDefaults(defineProps<ProFormProps>(), {
  labelPlacement: 'left',
  showLabel: true,
  showFeedback: true,
  showRequireMark: true,
})
</script>
