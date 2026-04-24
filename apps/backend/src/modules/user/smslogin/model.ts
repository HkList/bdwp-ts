import { t } from 'elysia'

export const SmsLoginModel = {
  checkPhoneStatusQuery: t.Object({
    phone: t.String(),
    key: t.String(),
  }),
  checkPhoneStatusSuccess: t.Object({
    message: t.Literal('获取手机号状态成功'),
    data: t.Null(),
  }),
  checkPhoneStatusFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),

  sendSmsQuery: t.Object({
    key: t.String(),
  }),
  sendSmsBody: t.Object({
    phone: t.String(),
  }),
  sendSmsSuccess: t.Object({
    message: t.Literal('发送验证码成功'),
    data: t.Null(),
  }),
  sendSmsFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),

  loginBySmsQuery: t.Object({
    key: t.String(),
  }),
  loginBySmsBody: t.Object({
    phone: t.String(),
    smsvc: t.String(),
  }),
  loginBySmsSuccess: t.Object({
    message: t.Literal('短信登录成功'),
    data: t.Object({
      login_id: t.String(),
    }),
  }),
  loginBySmsFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
}

export interface SmsLoginModelType {
  checkPhoneStatusQuery: typeof SmsLoginModel.checkPhoneStatusQuery.static
  sendSmsBody: typeof SmsLoginModel.sendSmsBody.static
  loginBySmsBody: typeof SmsLoginModel.loginBySmsBody.static
}
