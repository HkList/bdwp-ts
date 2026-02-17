<template>
  <NFlex vertical :size="20">
    <ProSearchFormPlus v-bind="formProps" />

    <ProDataTablePlus v-bind="tableProps">
      <template #toolbar>
        <NFlex :size="8">
          <NButton type="primary" :render-icon="renderIcon(Create)">新建用户</NButton>
          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            @click="deleteUsers(checkedRowKeys)"
          >
            批量删除
          </NButton>
        </NFlex>
      </template>
    </ProDataTablePlus>
  </NFlex>
</template>

<script lang="ts" setup>
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus/index.ts'
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus/index.ts'
import { useUsersStore } from '@frontend/stores/Admin/usersStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Create, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const usersStore = useUsersStore()

const { deleteUsers } = usersStore
const { checkedRowKeys, formProps, tableProps } = storeToRefs(usersStore)
</script>

<style lang="scss" scoped></style>
