import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { status } from 'elysia'

export interface GetPhoneStatusApiSuccessResponse {
  errInfo: {
    msg: '已存在'
    no: '0'
  }
  data: {
    jumpReg: string
  }
}

export interface GetPhoneStatusApiFailedResponse {
  errInfo: {
    msg: string
    no: string
  }
  data: {
    jumpReg: string
  }
}

export type GetPhoneStatusResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '获取手机号状态成功'
      data: {
        gid: string
        BAIDUID: string
      }
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

export interface CheckPhoneStatusOptions {
  phone: string
}

export async function checkPhoneStatus(
  options: CheckPhoneStatusOptions,
): Promise<GetPhoneStatusResponse> {
  if (!/^1[3-9]\d{9}$/.test(options.phone) || options.phone.length !== 11) {
    return status(403, {
      message: '请输入正确的手机号',
      data: null,
    })
  }

  const phone2 = `${options.phone.slice(0, 3)}+${options.phone.slice(3, 7)}+${options.phone.slice(7)}`
  const gid = crypto.randomUUID().toUpperCase()

  const rawResponse = await request.client<GetPhoneStatusApiSuccessResponse | GetPhoneStatusApiFailedResponse>('https://wappass.baidu.com/wp/api/security/getphonestatus', {
    method: 'post',
    headers: {
      'User-Agent': bdwp_config.BROWSER_USERAGENT,
    },
    searchParams: {
      v: Date.now(),
    },
    body: new URLSearchParams({
      mobilenum: phone2,
      clientfrom: '',
      tpl: 'tb',
      login_share_strategy: '',
      client: '',
      adapter: '0',
      t: Date.now().toString(),
      act: 'bind_mobile',
      loginLink: '0',
      smsLoginLink: '1',
      lPFastRegLink: '0',
      fastRegLink: '1',
      lPlayout: '0',
      lang: 'zh-cn',
      regLink: '1',
      action: 'login',
      loginmerge: '1',
      isphone: '0',
      dialogVerifyCode: '',
      dialogVcodestr: '',
      dialogVcodesign: '',
      gid,
      agreement: '1',
      vcodesign: '',
      vcodestr: '',
      sms: '1',
      username: options.phone,
      countrycode: '',
    }),
  })

  let response: GetPhoneStatusApiSuccessResponse | GetPhoneStatusApiFailedResponse
  try {
    response = await rawResponse.json()
  }
  catch {
    return status(500, {
      message: '获取手机号状态失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errInfo.no !== '0') {
    return status(500, {
      message: `获取手机号状态失败: ${response.errInfo.no} (${response.errInfo.msg})`,
      data: null,
    })
  }

  const BAIDUIDRow = rawResponse.headers.getSetCookie().find(ck => ck.startsWith('BAIDUID='))
  if (!BAIDUIDRow) {
    return status(500, {
      message: '获取手机号状态失败: 未找到BAIDUID',
      data: null,
    })
  }

  const BAIDUID = BAIDUIDRow.split(';')[0]?.split('=')[1]
  if (!BAIDUID) {
    return status(500, {
      message: '获取手机号状态失败: 无效的BAIDUID',
      data: null,
    })
  }

  return status(200, {
    message: '获取手机号状态成功',
    data: {
      BAIDUID,
      gid,
    },
  })
}
