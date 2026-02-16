<template>
  <ProCard :title="props.cardTitle">
    <ProDataTable v-bind="props" />
  </ProCard>
</template>

<script lang="ts" setup>
import { ProCard, ProDataTable } from 'pro-naive-ui'
import { type ProDataTablePlusProps } from '@frontend/components/ProDataTablePlus'

const props = withDefaults(defineProps<ProDataTablePlusProps>(), {
  bottomBordered: true,
  bordered: true,
  cascade: true,
  paginateSinglePage: true,
  singleLine: true,
})
</script>

<style lang="scss" scoped></style>
