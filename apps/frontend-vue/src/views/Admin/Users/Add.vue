<template>
  <ProModalForm title="新建用户" v-bind="addUserModalForm">
    <ProInput title="用户名" path="username" />
  </ProModalForm>
</template>

<script lang="ts" setup>
import { useUsersStore } from '@frontend/stores/Admin/usersStore.ts'
import { storeToRefs } from 'pinia'
import { ProInput, ProModalForm } from 'pro-naive-ui'

const usersStore = useUsersStore()
const { addUserModalForm } = storeToRefs(usersStore)
</script>

<style lang="scss" scoped></style>
