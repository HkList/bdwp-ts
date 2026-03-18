import type { SmsLoginModelType } from '@backend/modules/user/smslogin/model.ts'
import { api } from '@frontend/api/index.ts'
import { useProForm } from '@frontend/hooks/useProForm.ts'
import { useDownloadTicketStore } from '@frontend/stores/User/downloadTicketStore.ts'
import { message } from '@frontend/utils/discreteApi.ts'
import { wakeUpMobileApp } from '@frontend/utils/wakeup.ts'
import { useStorage } from '@vueuse/core'
import { defineStore, storeToRefs } from 'pinia'
import { useRequest } from 'pro-naive-ui'
import { computed, ref } from 'vue'

const phoneReg = /^1[3-9]\d{9}$/
export const LOGIN_ID_STORAGE_KEY = 'BDWP_LOGIN_ID'

export const useLoginStore = defineStore('user_login', () => {
  const downloadTicketStore = useDownloadTicketStore()
  const { key } = storeToRefs(downloadTicketStore)

  const loginId = useStorage<string | null>(LOGIN_ID_STORAGE_KEY, null)
  const isLogin = computed(() => !!loginId.value)

  const activeTab = ref('qrLogin')
  const handleChangeActiveTab = (value: string) => {
    activeTab.value = value
  }

  const qrCodeExpireTimeElapsed = ref(0)
  let interval: number = 0
  const { loading: getQrCodeLoading, data: getQrCodeResponse, runAsync: _getQrCode } = useRequest(api.user.qrlogin.get, { manual: true })
  const getQrCode = async () => {
    if (getQrCodeLoading.value) {
      return
    }

    clearInterval(interval)

    const res = await _getQrCode({ query: { key: key.value } })
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
        getQrCode()
      }
    }, 1000)

    return res
  }

  const { loading: loginByQrCodeLoading, runAsync: _loginByQrCode } = useRequest(api.user.qrlogin.login.post, { manual: true })
  const loginByQrCode = async () => {
    if (!getQrCodeResponse.value || getQrCodeResponse.value.error) {
      return
    }

    const res = await _loginByQrCode(
      { sign: getQrCodeResponse.value.data.data.sign },
      { query: { key: key.value } },
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

    wakeUpMobileApp(getQrCodeResponse.value.data.data.link)
  }

  const { loading: sendSmsLoading, runAsync: _sendSms } = useRequest(api.user.smslogin.send.post, { manual: true })
  const sendSms = async (body: SmsLoginModelType['sendSmsBody']) => {
    return await _sendSms(body, { query: { key: key.value } })
  }
  const sendSmsForm = async () => {
    await loginForm.value.form.validate('phone')
    return await sendSms({ phone: loginForm.value.form.fieldsValue.value.phone })
  }

  const { loading: loginBySmsLoading, runAsync: _loginBySms } = useRequest(api.user.smslogin.login.post, { manual: true })
  const loginBySms = async (body: SmsLoginModelType['loginBySmsBody']) => {
    const res = await _loginBySms(body, { query: { key: key.value } })
    if (!res.error) {
      loginId.value = res.data.data.login_id
    }

    return res
  }

  const loginForm = useProForm<Omit<SmsLoginModelType['loginBySmsBody'], 'smsvc'> & { smsvc: string[] }>({
    initialValues: {
      phone: '',
      smsvc: [],
    },
    rules: () => ({
      phone: [{ required: true }, { pattern: phoneReg, message: '请输入正确的手机号' }],
      smsvc: { type: 'array', required: true, len: 6, message: '请输入6位验证码' },
    }),
    onSubmit: (body) => {
      loginBySms({ ...body, smsvc: body.smsvc.join('') })
    },
  })

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

    loginForm,

    sendSms,
    sendSmsForm,
    sendSmsLoading,

    loginBySms,
    loginBySmsLoading,
  }
})
