<script lang="ts" setup>
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus/index.ts'
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus/index.ts'
import { useKeysStore } from '@frontend/stores/Admin/keysStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import Add from '@frontend/views/Admin/Keys/Add.vue'
import Edit from '@frontend/views/Admin/Keys/Edit.vue'
import { Create, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const keysStore = useKeysStore()

const { deleteKeys } = keysStore
const {
  addKeyModalForm,
  keyCheckedRowKeys,
  keyDataTableProps,
  keySearchFormProps,
  deleteKeysLoading,
} = storeToRefs(keysStore)
</script>

<template>
  <NFlex vertical :size="20">
    <Edit />
    <Add />

    <ProSearchFormPlus v-bind="keySearchFormProps" />

    <ProDataTablePlus v-bind="keyDataTableProps">
      <template #header-extra>
        <NFlex :size="8">
          <NButton
            type="primary"
            :render-icon="renderIcon(Create)"
            @click="addKeyModalForm.open()"
          >
            新建卡密
          </NButton>

          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            :loading="deleteKeysLoading"
            @click="deleteKeys(keyCheckedRowKeys)"
          >
            批量删除
          </NButton>
        </NFlex>
      </template>
    </ProDataTablePlus>
  </NFlex>
</template>

<style lang="scss" scoped></style>
