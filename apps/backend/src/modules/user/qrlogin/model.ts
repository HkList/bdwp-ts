import { t } from 'elysia'

export const QrloginModel = {
  getQrCodeQuery: t.Object({
    key: t.String(),
  }),
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
    message: t.String(),
    data: t.Null(),
  }),

  loginByQrCodeQuery: t.Object({
    key: t.String(),
  }),
  loginByQrCodeBody: t.Object({
    sign: t.String(),
  }),
  loginByQrCodeSuccess: t.Object({
    message: t.Literal('登录成功'),
    data: t.Object({
      login_id: t.String(),
    }),
  }),
  loginByQrCodeSuccessWaitingStatus: t.Object({
    message: t.TemplateLiteral([
      t.Literal('获取二维码状态成功: '),
      t.Union([t.Literal('二维码等待扫描中'), t.Literal('二维码等待确认中'), t.Literal('二维码取消登录')]),
    ]),
    data: t.Null(),
  }),
  loginByQrCodeFailed: t.Object({
    message: t.String(),
    data: t.Null(),
  }),
}

export interface QrloginModelType {
  loginByQrCodeBody: typeof QrloginModel.loginByQrCodeBody.static
}
