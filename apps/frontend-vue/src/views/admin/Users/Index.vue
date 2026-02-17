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
      :columns="tableColumns"
      v-bind="{ ...getUsersTableProps, ...dataTableSectionAttrs }"
    >
      <template #toolbar>
        <NFlex :size="8">
          <NButton type="primary">新建用户</NButton>
          <NButton type="warning">批量删除</NButton>
        </NFlex>
      </template>
    </ProDataTablePlus>
  </NFlex>
</template>

<script lang="ts" setup>
import { ProSearchFormPlus } from '@frontend/components/ProSearchFormPlus'
import { NFlex, NButton } from 'naive-ui'
import { computed, h } from 'vue'
import { renderProDateText, type ProDataTableColumns } from 'pro-naive-ui'
import type { TypeboxTypes } from '@backend/db'
import { useUsersStore } from '@frontend/stores/Admin/usersStore'
import { storeToRefs } from 'pinia'
import { ProDataTablePlus } from '@frontend/components/ProDataTablePlus'

const usersStore = useUsersStore()

const { getUsers } = usersStore
const {
  searchForm,
  searchFormColumns,
  searchFormRules,
  getUsersTableProps,
  searchFormProps,
  dataTableSectionAttrs,
} = storeToRefs(usersStore)

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
      title: '操作',
      key: 'actions',
      render: (_row) =>
        h(NFlex, null, {
          default: () => [
            h(
              NButton,
              {
                type: 'primary',
                size: 'small',
              },
              { default: () => '编辑' },
            ),
            h(
              NButton,
              {
                type: 'error',
                size: 'small',
              },
              { default: () => '删除' },
            ),
          ],
        }),
    },
  ]
})
</script>

<style lang="scss" scoped></style>
