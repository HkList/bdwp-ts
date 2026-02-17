import type { AuthModelType } from '@backend/modules/auth/model.ts'

import { api, useRequest } from '@frontend/api/index.ts'
import { useProForm } from '@frontend/utils/useProForm.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref<null | string>(localStorage.getItem(TOKEN_STORAGE_KEY))

  const isAuthenticated = computed(() => token.value !== null)

  const setToken = (newToken: null | string) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  const { loading: signInLoading, send: sendSignIn } = useRequest(api.auth.sign_in.post)
  const signIn = async () => {
    const response = await sendSignIn(signInForm.value.values.value)
    if (response.error) return
    setToken(response.data.data.token)
    router.push('/admin')
  }
  const { form: signInForm, rules: signInFormRules } = useProForm<AuthModelType['signInBody']>(
    {
      initialValues: {
        password: '',
        remember_me: false,
        username: '',
      },
      onSubmit: signIn,
    },
    {
      password: [{ message: '请输入密码', required: true, trigger: 'blur' }],
      username: [{ message: '请输入用户名', required: true, trigger: 'blur' }],
    },
  )

  const { loading: signOutLoading, send: sendSignOut } = useRequest(api.auth.sign_out.delete)
  const signOut = async () => {
    await sendSignOut()
    setToken(null)
    router.push('/sign_in')
  }

  return {
    isAuthenticated,
    setToken,
    signIn,

    signInForm,
    signInFormRules,
    signInLoading,
    signOut,

    signOutLoading,
    token,
  }
})
