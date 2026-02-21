<script lang="ts" setup>
import { useAuthStore } from '@frontend/stores/authStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { LogIn } from '@vicons/ionicons5'
import { NButton, NCard, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProCheckbox, ProForm, ProInput, ProPassword } from 'pro-naive-ui'

const authStore = useAuthStore()
const { signInForm, signInLoading } = storeToRefs(authStore)
</script>

<template>
  <NCard class="signIn">
    <NFlex vertical :size="24">
      <h1>欢迎登录</h1>

      <ProForm v-bind="signInForm">
        <ProInput title="用户名" path="username" />

        <ProPassword title="密码" path="password" />

        <ProCheckbox path="remember_me">
          7日内自动登录
        </ProCheckbox>

        <NButton
          attr-type="submit"
          type="primary"
          block
          :render-icon="renderIcon(LogIn)"
          :loading="signInLoading"
        >
          登录
        </NButton>
      </ProForm>
    </NFlex>
  </NCard>
</template>

<style lang="scss" scoped>
.signIn {
  width: 35%;
  margin: 100px auto;
  padding: 20px;

  @media (max-width: 1250px) {
    width: 50%;
  }

  @media (max-width: 1024px) {
    width: 80%;
  }
}
</style>
