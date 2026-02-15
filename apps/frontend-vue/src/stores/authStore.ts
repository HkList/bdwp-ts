import type { AuthModelType } from '@backend/modules/auth/model'
import { api, useRequest } from '@frontend/api'
import { useProForm } from '@frontend/utils/useProForm'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))

  const isAuthenticated = computed(() => token.value !== null)

  const setToken = (newToken: string | null) => {
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
        username: '',
        password: '',
        remember_me: false,
      },
      onSubmit: signIn,
    },
    {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    },
  )

  const { loading: signOutLoading, send: sendSignOut } = useRequest(api.auth.sign_out.delete)
  const signOut = async () => {
    await sendSignOut()
    setToken(null)
    router.push('/sign_in')
  }

  return {
    token,
    isAuthenticated,
    setToken,

    signInForm,
    signInFormRules,
    signInLoading,
    signIn,

    signOutLoading,
    signOut,
  }
})
