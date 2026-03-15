<script lang="ts" setup>
import { useLoginStore } from '@frontend/stores/User/loginStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { LogIn, Refresh } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProForm, ProInput, ProInputOtp } from 'pro-naive-ui'

const loginStore = useLoginStore()

const { sendSmsForm } = loginStore

const {
  sendSmsLoading,
  loginBySmsLoading,
  loginForm,
} = storeToRefs(loginStore)
</script>

<template>
  <ProForm v-bind="loginForm" :label-width="80">
    <ProInput title="手机号" path="phone" />

    <ProInputOtp
      title="验证码"
      path="smsvc"
    />

    <NFlex>
      <NButton
        type="info"
        block
        :render-icon="renderIcon(Refresh)"
        :loading="sendSmsLoading"
        @click="sendSmsForm"
      >
        获取验证码
      </NButton>

      <NButton
        attr-type="submit"
        type="primary"
        block
        :render-icon="renderIcon(LogIn)"
        :loading="loginBySmsLoading"
      >
        登录
      </NButton>
    </NFlex>
  </ProForm>
</template>

<style lang="scss" scoped></style>
