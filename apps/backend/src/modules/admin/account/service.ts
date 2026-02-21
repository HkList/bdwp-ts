import type { EnterpriseShareBindListResponseData, WxFileListData } from '@backend/api'
import type { TypeboxTypes } from '@backend/db'
import type { AccountModelType } from '@backend/modules/admin/account/model.ts'
import {
  getAccountInfo,
  getEnterpriseInfo,
  getEnterpriseShareBindList,
  getEnterpriseShareRecord,
  getEnterpriseTicketList,
  getTemplateVariable,
  getWxFileList,
} from '@backend/api'
import { Drizzle, Schemas } from '@backend/db'
import { createOrUpdateAccountQueue } from '@backend/queues/createOrUpdateAccount.ts'
import { toChunks } from '@backend/utils/toChunks.ts'
import { and, count, eq, inArray } from 'drizzle-orm'
import { status } from 'elysia'

export class AccountService {
  static async getEnterpriseInfo({ cookie }: AccountModelType['getEnterpriseInfoBody']) {
    return await getEnterpriseInfo({
      cookie,
    })
  }

  static async createAccount(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    body: AccountModelType['createAccountBody'],
  ) {
    // 判断是否已存在相同 cid 的账号
    const existingAccount = await Drizzle.query.Account.findFirst({
      where: {
        cid: body.cid.toString(),
        user_id: user.id,
      },
    })

    if (existingAccount) {
      return status(409, {
        message: '已存在相同 CID 的账号, 创建失败',
        data: null,
      })
    }

    const job = await createOrUpdateAccountQueue.add(
      'createOrUpdateAccount',
      {
        user,
        body,
        isUpdate: false,
      },
      {
        jobId: crypto.randomUUID(),
      },
    )

    if (!job.id) {
      return status(500, {
        message: '创建异步任务失败',
        data: null,
      })
    }

    return status(200, {
      message: '创建异步任务成功',
      data: {
        task_id: job.id,
      },
    })
  }

  static async getAccountData(
    cookie: string,
    cid: number,
    needShareLinkBindList = true,
    needWxFileList = true,
  ) {
    const accountInfo = await getAccountInfo({
      cookie,
    })
    if (accountInfo.code !== 200) {
      return accountInfo
    }
    const accountInfoData = accountInfo.response.data

    const templateVariable = await getTemplateVariable({
      cookie,
    })
    if (templateVariable.code !== 200) {
      return templateVariable
    }
    const templateVariableData = templateVariable.response.data

    const enterpriseInfo = await getEnterpriseInfo({
      cookie,
    })
    if (enterpriseInfo.code !== 200) {
      return enterpriseInfo
    }
    const enterpriseInfoData = enterpriseInfo.response.data.find(item => item.cid === cid)
    if (!enterpriseInfoData) {
      return status(500, {
        message: `获取企业信息失败: 未找到对应的企业信息 CID=${cid}`,
        data: null,
      })
    }

    const sharelink = await getEnterpriseShareRecord({
      cookie,
      cid: cid.toString(),
    })
    if (sharelink.code !== 200) {
      return sharelink
    }
    const sharelinkData = sharelink.response.data

    const bindSharelinkList: { [key: string]: EnterpriseShareBindListResponseData } = {}
    if (needShareLinkBindList) {
      const chunks = sharelinkData.map(item =>
        getEnterpriseShareBindList({
          cookie,
          cid: cid.toString(),
          shareid: item.shareId.toString(),
        }),
      )

      for (const chunk of toChunks(chunks, 5)) {
        const results = await Promise.all(chunk)
        for (const result of results) {
          if (result.code !== 200) {
            return result
          }
          bindSharelinkList[result.response.data.shareid] = result.response.data
        }
      }
    }

    const wxFileList: { [key: string]: WxFileListData } = {}
    if (needWxFileList) {
      const chunks = sharelinkData.map(item =>
        getWxFileList({
          surl: item.shorturl,
          pwd: item.passwd,
          dir: '/',
        }),
      )

      for (const chunk of toChunks(chunks, 5)) {
        const results = await Promise.all(chunk)
        for (const result of results) {
          if (result.code !== 200) {
            return result
          }
          wxFileList[result.response.data.shareid] = result.response.data
        }
      }
    }

    const ticketList = await getEnterpriseTicketList({
      cookie,
      cid: cid.toString(),
    })
    if (ticketList.code !== 200) {
      return ticketList
    }
    const ticketListData = ticketList.response.data[0]
    if (!ticketListData) {
      return status(500, {
        message: `获取企业票据列表失败: 未找到对应的企业票据信息 CID=${cid}`,
        data: null,
      })
    }

    return status(200, {
      message: '获取账号信息成功',
      data: {
        account_info: accountInfoData,
        enterprise_info: enterpriseInfoData,
        sharelink_info: sharelinkData,
        bind_sharelink_list: bindSharelinkList,
        template_variable: templateVariableData,
        ticket_list: ticketListData,
        wx_file_list: wxFileList,
      },
    })
  }

  static async deleteAccounts(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    body: AccountModelType['deleteAccountsBody'],
  ) {
    const { ids } = body

    try {
      await Drizzle.transaction(async (tx) => {
        const rows = await tx
          .delete(Schemas.Account)
          .where(and(eq(Schemas.Account.user_id, user.id), inArray(Schemas.Account.id, ids)))
          .returning({ id: Schemas.Account.id })

        if (rows.length !== ids.length) {
          throw new Error('IDS_NOT_ALL_FOUND')
        }

        return rows
      })
    }
    catch (error) {
      if (error instanceof Error && error.message === 'IDS_NOT_ALL_FOUND') {
        return status(404, {
          message: '部分账号不存在, 删除失败',
          data: null,
        })
      }
      throw error
    }

    return status(200, {
      message: '删除账号成功',
      data: null,
    })
  }

  static async updateAccounts(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    body: AccountModelType['updateAccountsBody'],
  ) {
    const ids = body.map(account => account.id)

    const existingAccounts = await Drizzle.select({
      id: Schemas.Account.id,
      cid: Schemas.Account.cid,
      cookie: Schemas.Account.cookie,
      baidu_name: Schemas.Account.baidu_name,
    })
      .from(Schemas.Account)
      .where(and(eq(Schemas.Account.user_id, user.id), inArray(Schemas.Account.id, ids)))

    if (existingAccounts.length !== ids.length) {
      return status(404, {
        message: '部分账号不存在, 更新失败',
        data: null,
      })
    }

    const task_id: string[] = []

    for (const account of existingAccounts) {
      const job = await createOrUpdateAccountQueue.add(
        'createOrUpdateAccount',
        {
          user,
          body: {
            ...account,
            cid: Number(account.cid),
            ...body.find(item => item.id === account.id),
          },
          isUpdate: true,
        },
        {
          jobId: crypto.randomUUID(),
        },
      )

      if (!job.id) {
        return status(500, {
          message: '创建异步任务失败',
          data: null,
        })
      }

      task_id.push(job.id)
    }

    return status(200, {
      message: '创建异步任务成功',
      data: {
        task_id,
      },
    })
  }

  static async getAllAccounts(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    query: AccountModelType['getAllAccountsQuery'],
  ) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10
    const { id, status: accountStatus } = query

    // 构建查询条件
    const conditions = [eq(Schemas.Account.user_id, user.id)]

    if (id) {
      conditions.push(eq(Schemas.Account.id, id))
    }

    if (accountStatus) {
      conditions.push(eq(Schemas.Account.status, accountStatus))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [accounts, total] = await Promise.all([
      Drizzle.select()
        .from(Schemas.Account)
        .limit(page_size)
        .offset((page - 1) * page_size)
        .where(where),
      Drizzle.select({ count: count() }).from(Schemas.Account).where(where),
    ])

    return status(200, {
      message: '获取账号列表成功',
      data: {
        page,
        page_size,
        total: total[0]!.count,
        data: accounts,
      },
    })
  }
}
