import type { AuthModelType } from '@backend/modules/auth/model.ts'
import { api, useRequest } from '@frontend/api/index.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'

export const useUserStore = defineStore('user', () => {
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
  const signIn = async (formData: AuthModelType['signInBody']) => {
    const response = await sendSignIn(formData)
    if (response.error) return
    setToken(response.data.data.token)
    router.push('/admin')
  }

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

    signInLoading,
    signIn,

    signOutLoading,
    signOut,
  }
})
