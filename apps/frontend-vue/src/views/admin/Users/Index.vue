<template>
  <NFlex vertical :size="20">
    <NCard>
      <NSearchForm v-model:value="searchForm" :columns="columns" @submit="handleSearchSubmit" />
    </NCard>

    <!-- <ProDataTable title="用户列表" row-key="id" :columns="tableColumns"></ProDataTable> -->
  </NFlex>
</template>

<script lang="ts" setup>
import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import { defineColumns, NSearchForm } from '@frontend/components/NSearchForm/index.ts'
import { NCard, NFlex } from 'naive-ui'
import { ref } from 'vue'

const { modelValue, columns } = defineColumns<UserModelType['getAllUsersQuery']>(() => [
  {
    title: '用户名',
    key: 'username',
  },
  {
    title: '用户ID',
    key: 'id',
    type: 'number',
  },
  {
    title: '创建时间',
    key: 'page',
    type: 'date',
  },
  {
    title: '每页数量',
    key: 'page_size',
    type: 'select',
    selectOptions: [
      { label: '10', value: 10 },
      { label: '20', value: 20 },
      { label: '50', value: 50 },
    ],
  },
])

const searchForm = ref<UserModelType['getAllUsersQuery']>({
  ...modelValue.value,
  page: 1,
  page_size: 10,
})

const handleSearchSubmit = () => {
  console.log('search form submitted', searchForm.value)
}

// const tableColumns = computed<ProDataTableColumns<TypeboxTypes['UserTypeboxSchemaType']>>(() => {
//   return [
//     {
//       title: 'ID',
//       key: 'id',
//       width: 80,
//     },
//     {
//       title: '用户名',
//       key: 'username',
//     },
//     {
//       title: '创建时间',
//       key: 'created_at',
//       render: (row) => renderProDateText(row.created_at),
//     },
//     {
//       title: '更新时间',
//       key: 'updated_at',
//       render: (row) => renderProDateText(row.updated_at),
//     },
//     {
//       title: '操作',
//       key: 'actions',
//     },
//   ]
// })
</script>

<style lang="scss" scoped></style>
