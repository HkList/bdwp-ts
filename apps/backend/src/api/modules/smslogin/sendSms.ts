import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { validatePhone } from '@backend/utils/validatePhone.ts'
import { status } from 'elysia'

export interface SendSmsApiSuccessResponse {
  errInfo: {
    no: '0'
    msg: '发送成功'
  }
  data: {
    vcodestr: ''
    vcodesign: ''
    isslide: ''
    needDelay: ''
    smsChannel: 'empty'
    smsCodeLength: number
    voiceSmsSwitch: 0
  }
  traceid: ''
}

export interface SendSmsApiFailedResponse {
  errInfo: {
    no: string
    msg: string
  }
}

export type SendSmsResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '发送验证码成功'
      data: null
    }
  >
  | ElysiaCustomStatusResponse<
    403,
    {
      message: '请输入正确的手机号'
      data: null
    }
  >
  | ElysiaCustomStatusResponse<
    500,
    {
      message: string
      data: null
    }
  >

export interface SendSmsOptions {
  phone: string
  BAIDUID: string
  gid: string
}

export async function sendSms(
  options: SendSmsOptions,
): Promise<SendSmsResponse> {
  if (!validatePhone(options.phone)) {
    return status(403, {
      message: '请输入正确的手机号',
      data: null,
    })
  }

  const response = await request.send<
    SendSmsApiSuccessResponse,
    SendSmsApiFailedResponse
  >(
    'https://wappass.baidu.com/wp/api/login/sms',
    {
      method: 'post',
      headers: {
        'User-Agent': bdwp_config.BROWSER_USERAGENT,
        'Cookie': `BAIDUID=${options.BAIDUID};`,
      },
      searchParams: {
        v: Date.now(),
      },
      body: new URLSearchParams({
        username: options.phone,
        tpl: 'tb',
        clientfrom: '',
        countrycode: '',
        gid: options.gid,
        dialogVerifyCode: '',
        vcodesign: '',
        vcodestr: '',
        vstrswitch: '1',
        time: Date.now().toString(),
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '发送验证码失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errInfo.no !== '0') {
    return status(500, {
      message: `发送验证码失败: ${response.errInfo.msg}`,
      data: null,
    })
  }

  return status(200, {
    message: '发送验证码成功',
    data: null,
  })
}
