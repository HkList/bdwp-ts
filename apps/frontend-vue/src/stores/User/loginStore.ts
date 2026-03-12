import { api } from '@frontend/api/index.ts'
import { message } from '@frontend/utils/discreteApi.ts'
import { wakeUpMobileApp } from '@frontend/utils/wakeup.ts'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { useRequest } from 'pro-naive-ui'
import { computed, ref } from 'vue'

export const LOGIN_ID_STORAGE_KEY = 'BDWP_LOGIN_ID'

export const useLoginStore = defineStore('user_login', () => {
  const loginId = useStorage<string | null>(LOGIN_ID_STORAGE_KEY, null)
  const isLogin = computed(() => !!loginId.value)

  const activeTab = ref('qrLogin')
  const handleChangeActiveTab = (value: string) => {
    activeTab.value = value
  }

  const qrCodeExpireTimeElapsed = ref(0)
  let interval: number = 0
  const { loading: getQrCodeLoading, data: getQrCodeResponse, runAsync: _getQrCode } = useRequest(api.user.qrlogin.get, { manual: true })
  const getQrCode = async (key: string) => {
    if (getQrCodeLoading.value) {
      return
    }

    clearInterval(interval)

    const res = await _getQrCode({ query: { key } })
    qrCodeExpireTimeElapsed.value = 60 * 2

    interval = window.setInterval(() => {
      if (activeTab.value !== 'qrLogin') {
        clearInterval(interval)
        return
      }

      if (qrCodeExpireTimeElapsed.value > 0) {
        qrCodeExpireTimeElapsed.value -= 1
      }
      else {
        message.info('二维码已过期，正在重新获取...')
        getQrCode(key)
      }
    }, 1000)

    return res
  }

  const { loading: loginByQrCodeLoading, runAsync: _loginByQrCode } = useRequest(api.user.qrlogin.login.post, { manual: true })
  const loginByQrCode = async (key: string) => {
    if (!getQrCodeResponse.value || getQrCodeResponse.value.error) {
      return
    }

    const res = await _loginByQrCode(
      { sign: getQrCodeResponse.value.data.data.sign },
      { query: { key } },
    )

    if (res.error || res.data.message !== '登录成功') {
      return
    }

    loginId.value = res.data.data.login_id

    return res
  }

  const wakeUpMobileAppLogin = () => {
    if (!getQrCodeResponse.value || getQrCodeResponse.value.error) {
      return
    }

    wakeUpMobileApp(getQrCodeResponse.value.data.data.imgurl)
  }

  return {
    loginId,
    isLogin,

    activeTab,
    handleChangeActiveTab,

    getQrCode,
    getQrCodeLoading,
    getQrCodeResponse,
    qrCodeExpireTimeElapsed,
    wakeUpMobileAppLogin,

    loginByQrCode,
    loginByQrCodeLoading,
  }
})
