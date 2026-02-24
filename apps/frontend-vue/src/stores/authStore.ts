import type { TypeboxTypes } from '@backend/db'
import type { AuthModelType } from '@backend/modules/auth/model.ts'

import { api } from '@frontend/api/index.ts'
import { useProForm } from '@frontend/hooks/useProForm.ts'
import { useRequest } from '@frontend/hooks/useRequest.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'
export const USER_TYPE_STORAGE_KEY = 'BDWP_USER_TYPE'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const token = ref<null | string>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const type = ref<null | TypeboxTypes['UserType']>(
    (localStorage.getItem(USER_TYPE_STORAGE_KEY) ?? 'user') as TypeboxTypes['UserType'],
  )

  const isAuthenticated = computed(() => token.value !== null)
  const isAdmin = computed(() => type.value === 'admin')

  const setToken = (newToken: null | string, userType: null | TypeboxTypes['UserType'] = null) => {
    token.value = newToken
    type.value = userType

    if (newToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    }
    else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }

    if (userType) {
      localStorage.setItem(USER_TYPE_STORAGE_KEY, userType)
    }
    else {
      localStorage.removeItem(USER_TYPE_STORAGE_KEY)
    }
  }

  const { loading: signInLoading, send: _signIn } = useRequest(api.auth.sign_in.post)
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

  const { loading: signOutLoading, send: _signOut } = useRequest(api.auth.sign_out.delete)
  const signOut = async () => {
    await _signOut()
    setToken(null, null)
    await router.push('/sign_in')
  }

  return {
    type,
    token,
    isAdmin,
    isAuthenticated,
    setToken,

    signIn,
    signInForm,
    signInLoading,

    signOut,
    signOutLoading,
  }
})
