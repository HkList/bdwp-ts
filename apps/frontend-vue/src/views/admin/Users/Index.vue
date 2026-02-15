<template>
  <NFlex vertical :size="20">
    <ProSearchFormPlus
      v-model:value="searchForm"
      :columns="searchFormColumns"
      :rules="searchFormRules"
      :hide-collapse-button="true"
      @search="getUsers"
      v-bind="searchFormProps"
    />

    <ProDataTablePlus
      card-title="用户列表"
      row-key="id"
      :columns="tableColumns"
      v-bind="getUsersTableProps"
    />
  </NFlex>
</template>

<script lang="ts" setup>
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus'
import { NFlex } from 'naive-ui'
import { computed } from 'vue'
import { renderProDateText, type ProDataTableColumns } from 'pro-naive-ui'
import type { TypeboxTypes } from '@backend/db'
import { useUsersStore } from '@frontend/stores/Admin/usersStore'
import { storeToRefs } from 'pinia'
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus'

const usersStore = useUsersStore()

const { getUsers } = usersStore
const { searchForm, searchFormColumns, searchFormRules, getUsersTableProps, searchFormProps } =
  storeToRefs(usersStore)

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
