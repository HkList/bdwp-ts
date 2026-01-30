import { AccountModel } from '@backend/modules/admin/account/model.ts'
import { AccountService } from '@backend/modules/admin/account/service.ts'
import { UserAuthPlugin } from '@backend/plugins/userAuthPlugin.ts'
import { Elysia } from 'elysia'

export const AccountModule = new Elysia({ prefix: '/accounts' })
  .use(UserAuthPlugin())
  .post('/get_enterprise_info', async ({ body }) => await AccountService.getEnterpriseInfo(body), {
    body: AccountModel.getEnterpriseInfoBody,
    response: {
      200: AccountModel.getEnterpriseInfoSuccess,
      500: AccountModel.getEnterpriseInfoFailed,
    },
    detail: {
      summary: '获取企业信息',
      tags: ['账号管理'],
    },
  })
  .post('/', async ({ user, body }) => await AccountService.createAccount(user, body), {
    body: AccountModel.createAccountBody,
    response: {
      201: AccountModel.createAccountSuccess,
      500: AccountModel.createAccountFailed,
    },
    detail: {
      summary: '创建账号',
      tags: ['账号管理'],
    },
  })
  .delete('/', async ({ user, body }) => await AccountService.deleteAccounts(user, body), {
    body: AccountModel.deleteAccountsBody,
    response: {
      200: AccountModel.deleteAccountsSuccess,
      404: AccountModel.deleteAccountsFailedNotFound,
    },
    detail: {
      summary: '删除账号',
      tags: ['账号管理'],
    },
  })
  .patch('/', async ({ user, body }) => await AccountService.updateAccounts(user, body), {
    body: AccountModel.updateAccountsBody,
    response: {
      201: AccountModel.updateAccountsSuccess,
      500: AccountModel.updateAccountsFailed,
      404: AccountModel.updateAccountsFailedNotFound,
    },
    detail: {
      summary: '更新账号信息',
      tags: ['账号管理'],
    },
  })
  .get('/', async ({ user, query }) => await AccountService.getAllAccounts(user, query), {
    query: AccountModel.getAllAccountsQuery,
    response: {
      200: AccountModel.getAllAccountsSuccess,
    },
    detail: {
      summary: '获取所有账号',
      tags: ['账号管理'],
    },
  })
