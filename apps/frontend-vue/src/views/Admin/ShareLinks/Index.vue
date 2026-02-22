<script lang="ts" setup>
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus/index.ts'
import { useShareLinksStore } from '@frontend/stores/Admin/shareLinksStore.ts'
import { NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const shareLinksStore = useShareLinksStore()

const { shareLinkDataTableProps } = storeToRefs(shareLinksStore)
</script>

<template>
  <NFlex vertical :size="20">
    <ProDataTablePlus v-bind="shareLinkDataTableProps" />
  </NFlex>
</template>

<style lang="scss" scoped></style>
