<template>
  <NFlex vertical :size="20">
    <NCard>
      <NSearchForm
        v-model:value="searchForm"
        :columns="searchFormColumns"
        :rules="searchFormRules"
        :hide-collapse-button="true"
        @submit="getUsers"
      />
    </NCard>

    <ProDataTable
      title="用户列表"
      row-key="id"
      :columns="tableColumns"
      v-bind="getUsersTableProps"
    />
  </NFlex>
</template>

<script lang="ts" setup>
import { NSearchForm } from '@frontend/components/NSearchForm/index.ts'
import { NCard, NFlex } from 'naive-ui'
import { computed } from 'vue'
import { ProDataTable, renderProDateText, type ProDataTableColumns } from 'pro-naive-ui'
import type { TypeboxTypes } from '@backend/db'
import { useUserStore } from '@frontend/stores/Admin/usersStore.ts'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

const { getUsers } = userStore
const { searchForm, searchFormColumns, searchFormRules, getUsersTableProps } =
  storeToRefs(userStore)

const tableColumns = computed<ProDataTableColumns<TypeboxTypes['UserTypeboxSchemaType']>>(() => {
  return [
    {
      title: '选择',
      type: 'selection',
    },
    {
      title: 'ID',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      key: 'username',
    },
    {
      title: '创建时间',
      key: 'created_at',
      render: (row) => renderProDateText(row.created_at),
    },
    {
      title: '更新时间',
      key: 'updated_at',
      render: (row) => renderProDateText(row.updated_at),
    },
    {
      title: '操作',
      key: 'actions',
    },
  ]
})
</script>

<style lang="scss" scoped></style>
