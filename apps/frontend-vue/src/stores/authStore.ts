import type { AuthModelType } from '@backend/modules/auth/model.ts'

import { api } from '@frontend/api/index.ts'
import { useProForm } from '@frontend/hooks/useProForm.ts'
import { useUserStore } from '@frontend/stores/userStore.ts'
import { defineStore } from 'pinia'
import { useRequest } from 'pro-naive-ui'
import { useRouter } from 'vue-router'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'
export const USER_TYPE_STORAGE_KEY = 'BDWP_USER_TYPE'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { setToken } = useUserStore()

  const { loading: signInLoading, runAsync: _signIn } = useRequest(api.auth.sign_in.post, { manual: true })
  const signIn = async (values: AuthModelType['signInBody']) => {
    const { error, data } = await _signIn(values)
    if (error) {
      return
    }

    setToken(data.data.token, data.data.type)
    await router.push('/admin')
  }
  const signInForm = useProForm<AuthModelType['signInBody']>({
    initialValues: {
      password: '',
      username: '',
      remember_me: false,
    },
    rules: () => ({
      password: { required: true },
      username: { required: true },
    }),
    onSubmit: signIn,
  })

  const { loading: signOutLoading, runAsync: _signOut } = useRequest(api.auth.sign_out.delete, { manual: true })
  const signOut = async () => {
    await _signOut()
    setToken(null, null)
    await router.push('/sign_in')
  }

  return {
    signIn,
    signInForm,
    signInLoading,

    signOut,
    signOutLoading,
  }
})
