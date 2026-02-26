import type { TypeboxTypes } from '@backend/db'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

export const TOKEN_STORAGE_KEY = 'BDWP_TOKEN'
export const USER_TYPE_STORAGE_KEY = 'BDWP_USER_TYPE'

export const useUserStore = defineStore('user', () => {
  const token = useStorage<string | null>(TOKEN_STORAGE_KEY, null)
  const type = useStorage<TypeboxTypes['UserType'] | null>(USER_TYPE_STORAGE_KEY, null)

  const isAuthenticated = computed(() => token.value !== null)
  const isAdmin = computed(() => type.value === 'admin')

  const setToken = (newToken: null | string, userType: null | TypeboxTypes['UserType'] = null) => {
    token.value = newToken
    type.value = userType
  }

  return {
    type,
    token,
    isAdmin,
    isAuthenticated,
    setToken,
  }
})
