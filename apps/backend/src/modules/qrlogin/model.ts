import { t } from 'elysia'

export const QrloginModel = {
  getQrCodeSuccess: t.Object({
    message: t.Literal('获取二维码成功'),
    data: t.Object({
      errno: t.Literal(0),
      imgurl: t.String(),
      sign: t.String(),
      prompt: t.String(),
    }),
  }),
  getQrCodeFailed: t.Object({
    message: t.TemplateLiteral([t.Literal('获取二维码失败: '), t.Number()]),
    data: t.Null(),
  }),
  getQroCodeFailedApiInvalid: t.Object({
    message: t.Literal('获取二维码失败, 接口可能失效'),
    data: t.Null(),
  }),

  loginByQrcodeQuery: t.Object({
    sign: t.String(),
  }),
  loginByQrcodeSuccess: t.Object({
    message: t.Literal('登录成功'),
    data: t.Object({
      login_id: t.String(),
    }),
  }),
  loginByQrcodeSuccessWaitingStatus: t.Object({
    message: t.TemplateLiteral([
      t.Literal('获取二维码状态成功: '),
      t.Union([t.Literal('二维码等待确认中'), t.Literal('二维码取消登录')]),
    ]),
    data: t.Null(),
  }),
  loginByQrcodeFailedApiInvalid: t.Object({
    message: t.Literal('获取二维码状态失败, 接口可能失效'),
    data: t.Null(),
  }),
  loginByQrcodeFailed: t.Object({
    message: t.TemplateLiteral([
      t.Literal('获取二维码状态失败: '),
      t.Union([
        t.Literal('gid查询失败'),
        t.Literal('bduss获取失败'),
        t.Literal('二维码等待确认中'),
        t.Number(),
      ]),
    ]),
    data: t.Null(),
  }),
  loginByQrcodeFailedGetBdussError: t.Object({
    message: t.Union([
      t.Literal('获取CK失败, 接口可能失效'),
      t.TemplateLiteral([
        t.Literal('获取CK失败: '),
        t.Union([
          t.Literal('接口数据解析失败'),
          t.Number(),
          t.TemplateLiteral([t.String(), t.Literal(' ('), t.String(), t.Literal(')')]),
          t.Literal('stoken获取失败'),
          t.Literal('bduss获取失败'),
        ]),
      ]),
    ]),
    data: t.Null(),
  }),
  loginByQrcodeFailedGetFullCookieError: t.Object({
    message: t.Literal('获取完整CK失败'),
    data: t.Null(),
  }),
}

export interface QrloginModelType {
  loginByQrcodeQuery: typeof QrloginModel.loginByQrcodeQuery.static
}
