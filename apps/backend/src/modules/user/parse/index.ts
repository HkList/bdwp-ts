import { ParseModel } from '@backend/modules/user/parse/model.ts'
import { ParseService } from '@backend/modules/user/parse/service.ts'
import { Elysia } from 'elysia'

export const ParseModule = new Elysia({ prefix: '/parse' })
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
      summary: '获取解析列表',
      tags: ['解析组件'],
    },
  })
  // .post('/transfer', async ({ body }) => await ParseService.transfer(body), {
  //   body: ParseModel.transferBody,
  //   response: {
  //     200: ParseModel.transferSuccess,
  //     500: ParseModel.transferFailed,
  //   },
  //   detail: {
  //     summary: '转存文件',
  //     tags: ['解析组件'],
  //   },
  // })
