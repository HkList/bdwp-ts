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
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus'
import { NFlex, NButton } from 'naive-ui'
import { useUsersStore } from '@frontend/stores/Admin/usersStore'
import { storeToRefs } from 'pinia'
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Create, Trash } from '@vicons/ionicons5'

const usersStore = useUsersStore()

const { deleteUsers } = usersStore
const { formProps, tableProps, checkedRowKeys } = storeToRefs(usersStore)
</script>

<style lang="scss" scoped></style>
