<template>
  <ProModalForm title="编辑用户" v-bind="updateUsersModalForm">
    <ProDigit title="用户ID" path="id" readonly />

    <ProInput title="用户名" path="username" />

    <ProInput title="密码" path="password" tooltip="为空则不修改密码" />
  </ProModalForm>
</template>

<script lang="ts" setup>
import { useUsersStore } from '@frontend/stores/Admin/usersStore.ts'
import { storeToRefs } from 'pinia'
import { ProInput, ProModalForm, ProDigit } from 'pro-naive-ui'

const usersStore = useUsersStore()
const { updateUsersModalForm } = storeToRefs(usersStore)
</script>

<style lang="scss" scoped></style>
