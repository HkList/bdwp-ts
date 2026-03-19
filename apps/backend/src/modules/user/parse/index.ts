import { ParseModel } from '@backend/modules/user/parse/model.ts'
import { ParseService } from '@backend/modules/user/parse/service.ts'
import { KeyAuthPlugin } from '@backend/plugins/keyAuthPlugin.ts'
import { Elysia } from 'elysia'

export const ParseModule = new Elysia({ prefix: '/parse' })
  .use(KeyAuthPlugin())
  .get('/get_key_info', async ({ query }) => await ParseService.getKeyInfo(query), {
    query: ParseModel.getKeyInfoQuery,
    response: {
      200: ParseModel.getKeyInfoSuccess,
      404: ParseModel.getKeyInfoFailedNotFound,
    },
    detail: {
      summary: '获取解析密钥信息',
      tags: ['解析组件'],
    },
  })
  .get('/get_list', async ({ query }) => await ParseService.getList(query), {
    query: ParseModel.getListQuery,
    response: {
      200: ParseModel.getListSuccess,
      500: ParseModel.getListFailed,
    },
    detail: {
      summary: '获取文件列表',
      tags: ['解析组件'],
    },
  })
  .post('/transfer', async ({ key, body }) => await ParseService.transfer(key, body), {
    query: ParseModel.transferQuery,
    body: ParseModel.transferBody,
    response: {
      200: ParseModel.transferSuccess,
      500: ParseModel.transferFailed,
    },
    detail: {
      summary: '转存文件',
      tags: ['解析组件'],
    },
  })
  .post('/sign_out', async ({ body }) => await ParseService.signOut(body), {
    query: ParseModel.signOutQuery,
    body: ParseModel.signOutBody,
    response: {
      200: ParseModel.signOutSuccess,
    },
    detail: {
      summary: '退出登录',
      tags: ['解析组件'],
    },
  })
