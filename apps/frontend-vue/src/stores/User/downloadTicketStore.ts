import { api } from '@frontend/api/index.ts'
import { defineStore } from 'pinia'
import { useRequest } from 'pro-naive-ui'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const useDownloadTicketStore = defineStore('user_download_ticket', () => {
  const route = useRoute()
  const key = computed<string>(() => {
    if (Array.isArray(route.params.key)) {
      return route.params.key[0] ?? ''
    }
    return route.params.key ?? ''
  })

  // 获取卡密信息
  const { loading: getKeyInfoLoading, data: keyInfo, runAsync: getKeyInfo } = useRequest(api.user.parse.get_key_info.get, { manual: true })

  return {
    key,

    keyInfo,
    getKeyInfo,
    getKeyInfoLoading,
  }
})
