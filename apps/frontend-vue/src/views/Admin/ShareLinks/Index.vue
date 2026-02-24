<script lang="ts" setup>
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus/index.ts'
import ProSearchFormPlus from '@frontend/components/ProSearchFormPlus/ProSearchFormPlus.vue'
import { useShareLinksStore } from '@frontend/stores/Admin/shareLinksStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const shareLinksStore = useShareLinksStore()

const { deleteShareLinks } = shareLinksStore
const { shareLinkSearchFormProps, shareLinkDataTableProps, deleteShareLinksLoading, shareLinkCheckedRowKeys } = storeToRefs(shareLinksStore)
</script>

<template>
  <NFlex vertical :size="20">
    <ProSearchFormPlus
      v-bind="shareLinkSearchFormProps"
    />

    <ProDataTablePlus v-bind="shareLinkDataTableProps" :scroll-x="1700">
      <template #header-extra>
        <NFlex>
          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            :loading="deleteShareLinksLoading"
            @click="deleteShareLinks({ ids: shareLinkCheckedRowKeys })"
          >
            批量删除
          </NButton>

          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            :loading="deleteShareLinksLoading"
            @click="deleteShareLinks({ ids: shareLinkCheckedRowKeys, force: true })"
          >
            批量强制删除
          </NButton>
        </NFlex>
      </template>
    </ProDataTablePlus>
  </NFlex>
</template>

<style lang="scss" scoped></style>
