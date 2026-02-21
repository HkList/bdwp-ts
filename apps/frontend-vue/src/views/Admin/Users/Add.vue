<script lang="ts" setup>
import { useUsersStore } from '@frontend/stores/Admin/usersStore.ts'
import { storeToRefs } from 'pinia'
import { ProInput, ProModalForm } from 'pro-naive-ui'

const usersStore = useUsersStore()
const { addUserModalForm } = storeToRefs(usersStore)
</script>

<template>
  <ProModalForm title="新建用户" v-bind="addUserModalForm">
    <ProInput title="用户名" path="username" />

    <ProInput title="密码" path="password" />
  </ProModalForm>
</template>

<style lang="scss" scoped></style>
