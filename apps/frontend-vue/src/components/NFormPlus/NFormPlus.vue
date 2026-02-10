<template>
  <NForm ref="formRef" label-placement="left" v-bind="attrs" @submit.prevent="handleSubmit">
    <slot />
  </NForm>
</template>

<script lang="ts" setup>
import type { FormInst } from 'naive-ui'
import { NForm } from 'naive-ui'
import { useTemplateRef, useAttrs } from 'vue'

const attrs = useAttrs()
const emit = defineEmits<{
  submit: [e: Event]
}>()

const formRef = useTemplateRef<FormInst>('formRef')

const handleSubmit = async (e: Event) => {
  try {
    // 自动执行表单验证
    await formRef.value?.validate()
    // 验证通过后，emit submit 事件给外部
    emit('submit', e)
  } catch (error) {
    // 只在开发模式下提示验证失败
    if (import.meta.env.DEV) {
      console.error('[NFormPlus] 表单验证失败, 仅显示在开发模式:', error)
    }
  }
}
</script>
