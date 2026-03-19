import type { ElysiaCustomStatusResponse } from 'elysia'
import { bdwp_config } from '@backend/config.ts'
import { request } from '@backend/utils/request.ts'
import { validatePhone } from '@backend/utils/validatePhone.ts'
import { status } from 'elysia'

export interface LoginBySmsApiSuccessResponse {
  errInfo: {
    no: '0'
    msg: ''
  }
  data: {
    u: string
    serverTime: string
    codeString: string
    bduss: string
    RefreshToken: string
    ptoken: string
    bcsn: string
    bcsync: string
    bcchecksum: string
    bctime: string
    gotoUrl: string
    userid: string
    phone: string
    appealurl: string
    second_u: string
    ppU: string
    realnameswitch: string
    appealcode: string
    unbancode: string
    ppDatau: string
    livinguname: string
    liveSecurity: string
    xml: string
    username: string
    realName: string
    bdstoken: string
    bdstokenback: string
    authsid: string
    authsidback: string
    authtoken: string
    lstr: string
    ltoken: string
    isChangePwd: string
    isSilenceAccount: string
    jumpset: string
    secstate: string
    ori_u: string
    showType: string
    email: string
    realnameverifyemail: string
    mobile: string
    mobileHidden: string
    countrycode: string
    idcard: string
    liveUsername: string
    loginProxy: string
    verifyUrl: string
    hasGuideFaceLogin: string
    guideFaceAuthsid: string
    isFinanceTpl: string
    openSwitchType: string
    authtokenFaceLogin: string
    guidefrom: string
    isFinance: string
    headImage: string
    defaultUserName: string
    isslide: string
    ppIsUpgradeMobile: string
    ppEncryptUserid: string
    hasRealName: string
    scscene: string
    scnewuser: string
    degradeUpSms: string
    needDelayHint: string
    portraitSign: string
    portrait: string
    isReg: string
    guide_set_pwd_uname: string
    secauthsid: string
    secbdstoken: string
    switchJsonSec: boolean
    switchJsonRealName: boolean
    bindMobileToken: string
    hitWlwFreeTime: number
    nextUrl: string
    target: string
  }
}

export interface LoginBySmsApiFailedResponse {
  errInfo: {
    no: string
    msg: string
  }
}

export type LoginBySmsResponse
  = | ElysiaCustomStatusResponse<
    200,
    {
      message: '短信登录成功'
      data: {
        bduss: string
        stoken: string
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

export interface LoginBySmsOptions {
  phone: string
  BAIDUID: string
  gid: string
  smsvc: string
}

const stokenReg = /<stoken>netdisk#(.*?)<\/stoken>/

export async function loginBySms(
  options: LoginBySmsOptions,
): Promise<LoginBySmsResponse> {
  if (!validatePhone(options.phone)) {
    return status(403, {
      message: '请输入正确的手机号',
      data: null,
    })
  }

  const response = await request.send<
    LoginBySmsApiSuccessResponse,
    LoginBySmsApiFailedResponse
  >(
    'https://wappass.baidu.com/wp/api/login',
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
        smsvc: options.smsvc,
        clientfrom: '',
        tpl: 'tb',
        login_share_strategy: '',
        client: '',
        adapter: '0',
        t: Date.now().toString(),
        loginLink: '0',
        smsLoginLink: '1',
        lPFastRegLink: '0',
        fastRegLink: '1',
        lPlayout: '0',
        lang: 'zh-cn',
        regLink: '1',
        action: 'login',
        loginmerge: '',
        isphone: '0',
        dialogVerifyCode: '',
        dialogVcodestr: '',
        dialogVcodesign: '',
        gid: options.gid,
        agreement: '1',
        vcodesign: '',
        vcodestr: '',
        smsverify: '1',
        sms: '1',
        mobilenum: options.phone,
        username: options.phone,
        countrycode: '',
        passAppHash: '',
        passAppVersion: '',
      }),
    },
  )

  if (typeof response === 'string') {
    return status(500, {
      message: '短信登录失败: 接口可能失效',
      data: null,
    })
  }

  if (response.errInfo.no !== '0') {
    return status(500, {
      message: `短信登录失败: ${response.errInfo.msg}`,
      data: null,
    })
  }

  const typedResponse = response as LoginBySmsApiSuccessResponse
  const xml = typedResponse.data.xml
  const stokenMatch = xml.match(stokenReg)
  const stoken = stokenMatch?.[1]
  if (!stokenMatch || !stoken) {
    return status(500, {
      message: '短信登录失败: 无法从响应中提取stoken',
      data: null,
    })
  }

  return status(200, {
    message: '短信登录成功',
    data: {
      bduss: typedResponse.data.bduss,
      stoken,
    },
  })
}
