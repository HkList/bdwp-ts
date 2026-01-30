import { KeyModel } from '@backend/modules/admin/key/model.ts'
import { KeyService } from '@backend/modules/admin/key/service.ts'
import { UserAuthPlugin } from '@backend/plugins/userAuthPlugin.ts'
import { Elysia } from 'elysia'

export const KeyModule = new Elysia({ prefix: '/keys' })
  .use(UserAuthPlugin())
  .post('/', async ({ user, body }) => await KeyService.createKey(user, body), {
    body: KeyModel.createKeyBody,
    response: {
      201: KeyModel.createKeySuccess,
      404: KeyModel.createKeyFailedAccountNotFound,
    },
    detail: {
      summary: '创建卡密',
      tags: ['卡密管理'],
    },
  })
  .delete('/', async ({ user, body }) => await KeyService.deleteKeys(user, body), {
    body: KeyModel.deleteKeysBody,
    response: {
      200: KeyModel.deleteKeysSuccess,
      404: KeyModel.deleteKeysFailedNotFound,
    },
    detail: {
      summary: '删除卡密',
      tags: ['卡密管理'],
    },
  })
  // .patch('/', async ({ body }) => await KeyService.updateKeys(body), {
  //   body: KeyModel.updateKeysBody,
  //   response: {
  //     201: KeyModel.updateKeysSuccess,
  //     404: KeyModel.updateKeysFailedNotFound,
  //   },
  //   detail: {
  //     summary: '更新卡密信息',
  //     tags: ['卡密管理'],
  //   },
  // })
  .get('/', async ({ user, query }) => await KeyService.getAllKeys(user, query), {
    query: KeyModel.getAllKeysQuery,
    response: {
      200: KeyModel.getAllKeysSuccess,
    },
    detail: {
      summary: '获取所有卡密',
      tags: ['卡密管理'],
    },
  })
