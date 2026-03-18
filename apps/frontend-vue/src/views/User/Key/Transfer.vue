<script lang="ts" setup>
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus/index.ts'
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus/index.ts'
import { useDownloadTicketStore } from '@frontend/stores/User/downloadTicketStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { File } from '@vicons/fa'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const downloadTicketStore = useDownloadTicketStore()

const { transferSelectedFile } = downloadTicketStore
const {
  fileListSearchFormProps,
  fileListDataTableProps,
  fileListCheckedRowKeys,
} = storeToRefs(downloadTicketStore)
</script>

<template>
  <NFlex :style="{ width: '100%' }" :size="20">
    <ProSearchFormPlus v-bind="fileListSearchFormProps" />

    <ProDataTablePlus v-bind="fileListDataTableProps">
      <template #header-extra>
        <NButton
          type="primary"
          :disabled="fileListCheckedRowKeys.length === 0"
          :render-icon="renderIcon(File)"
          @click="transferSelectedFile"
        >
          转存选中的文件
        </NButton>
      </template>
    </ProDataTablePlus>
  </NFlex>
</template>

<style lang="scss">
.cardLayout {
  width: 60dvw !important;

  > .n-card-content {
    width: calc(60dvw - 10px);
  }
}
</style>
