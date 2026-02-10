<template>
  <NCard class="signIn">
    <NSpace vertical :size="24">
      <h1>欢迎登录</h1>

      <NFormPlus :label-width="80" :model="formData" :rules="formRules" @submit="onSubmit">
        <NFormItem label="用户名" path="username">
          <NInput v-model:value="formData.username" placeholder="请输入用户名" clearable />
        </NFormItem>

        <NFormItem label="密码" path="password">
          <NInput
            v-model:value="formData.password"
            type="password"
            placeholder="请输入密码"
            showPassword-on="click"
            clearable
          />
        </NFormItem>

        <NFormItem>
          <NCheckbox v-model:checked="formData.remember_me"> 7日内自动登录 </NCheckbox>
        </NFormItem>

        <NButton
          attr-type="submit"
          type="primary"
          block
          :render-icon="renderIcon(LogIn)"
          :loading="signInLoading"
        >
          登录
        </NButton>
      </NFormPlus>
    </NSpace>
  </NCard>
</template>

<script lang="ts" setup>
import type { AuthModelType } from '@backend/modules/auth/model.ts'
import { NFormPlus } from '@frontend/components/NFormPlus/index.ts'
import { useUserStore } from '@frontend/stores/userStore'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { LogIn } from '@vicons/ionicons5'
import { NCard, NButton, NCheckbox, NFormItem, NInput, NSpace, type FormRules } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const formData = ref<AuthModelType['signInBody']>({
  username: '',
  password: '',
  remember_me: false,
})
const formRules = ref<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const userStore = useUserStore()

const { signIn } = userStore
const { signInLoading } = storeToRefs(userStore)

const onSubmit = async () => {
  await signIn(formData.value)
}
</script>

<style lang="scss" scoped>
.signIn {
  width: 30%;
  height: 45%;
  margin: 100px auto;
  padding: 20px;

  @media (max-width: 1024px) {
    width: 80%;
    height: 80%;
  }
}
</style>
