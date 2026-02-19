<template>
  <NFlex vertical :size="20">
    <Add />
    <Edit />

    <ProSearchFormPlus v-bind="userSearchFormProps" />

    <ProDataTablePlus v-bind="userDataTableProps">
      <template #header-extra>
        <NFlex :size="8">
          <NButton
            type="primary"
            :render-icon="renderIcon(Create)"
            @click="addUserModalForm.open()"
          >
            新建用户
          </NButton>

          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            @click="deleteUsers(userCheckedRowKeys)"
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
import Add from '@frontend/views/Admin/Users/Add.vue'
import Edit from '@frontend/views/Admin/Users/Edit.vue'
import { Create, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const usersStore = useUsersStore()

const { deleteUsers } = usersStore
const { addUserModalForm, userCheckedRowKeys, userDataTableProps, userSearchFormProps } =
  storeToRefs(usersStore)
</script>

<style lang="scss" scoped></style>
