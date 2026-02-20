<template>
  <NFlex vertical :size="20">
    <Add />
    <!-- <Edit /> -->

    <ProSearchFormPlus v-bind="accountSearchFormProps" />

    <ProDataTablePlus v-bind="accountDataTableProps">
      <template #header-extra>
        <NFlex :size="8">
          <NButton
            type="primary"
            :render-icon="renderIcon(Create)"
            @click="addAccountModalForm.open()"
          >
            新建账号
          </NButton>

          <NButton
            type="error"
            :render-icon="renderIcon(Trash)"
            :loading="deleteAccountsLoading"
            @click="deleteAccounts(accountCheckedRowKeys)"
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
import { useAccountsStore } from '@frontend/stores/Admin/accountsStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import Add from '@frontend/views/Admin/Accounts/Add.vue'
// import Edit from '@frontend/views/Admin/Users/Edit.vue'
import { Create, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'

const accountsStore = useAccountsStore()

const { deleteAccounts } = accountsStore
const {
  addAccountModalForm,
  accountCheckedRowKeys,
  accountDataTableProps,
  accountSearchFormProps,
  deleteAccountsLoading,
} = storeToRefs(accountsStore)
</script>

<style lang="scss" scoped></style>
