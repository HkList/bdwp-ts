<template>
  <NCard class="signIn">
    <NFlex vertical :size="24">
      <h1>欢迎登录</h1>

      <ProFormPlus :form="signInForm" :rules="signInFormRules">
        <ProInput title="用户名" path="username" />

        <ProPassword title="密码" path="password" />

        <ProCheckbox path="remember_me"> 7日内自动登录 </ProCheckbox>

        <NButton
          attr-type="submit"
          type="primary"
          block
          :render-icon="renderIcon(LogIn)"
          :loading="signInLoading"
        >
          登录
        </NButton>
      </ProFormPlus>
    </NFlex>
  </NCard>
</template>

<script lang="ts" setup>
import { ProFormPlus } from '@frontend/components/ProFormPlus'
import { useAuthStore } from '@frontend/stores/authStore'
import { renderIcon } from '@frontend/utils/renderIcon'
import { LogIn } from '@vicons/ionicons5'
import { NCard, NFlex, NButton } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProInput, ProCheckbox, ProPassword } from 'pro-naive-ui'

const authStore = useAuthStore()
const { signInLoading, signInFormRules, signInForm } = storeToRefs(authStore)
</script>

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
