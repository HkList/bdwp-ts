<script lang="ts" setup>
import { useAccountsStore } from '@frontend/stores/Admin/accountsStore.ts'
import { storeToRefs } from 'pinia'
import { ProDigit, ProInput, ProModalForm } from 'pro-naive-ui'

const accountsStore = useAccountsStore()
const { updateAccountsModalForm } = storeToRefs(accountsStore)
</script>

<template>
  <ProModalForm title="编辑账号" v-bind="updateAccountsModalForm">
    <ProDigit title="账号ID" path="id" readonly />

    <ProInput title="账号名称" path="baidu_name" />

    <ProInput title="Cookie" path="cookie" />
  </ProModalForm>
</template>

<style lang="scss" scoped></style>
