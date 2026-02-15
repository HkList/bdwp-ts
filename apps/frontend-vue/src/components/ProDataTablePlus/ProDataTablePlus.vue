<template>
  <ProCard :title="props.cardTitle">
    <ProDataTable v-bind="props" />
  </ProCard>
</template>

<script lang="ts" setup>
import { ProCard, ProDataTable } from 'pro-naive-ui'
import { type ProDataTablePlusProps } from '@frontend/components/ProDataTablePlus'

const props = defineProps<ProDataTablePlusProps>()
</script>

<style lang="scss" scoped></style>
