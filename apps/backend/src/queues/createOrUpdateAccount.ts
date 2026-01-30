import type { TypeboxTypes } from '@backend/db'
import type { AccountModelType } from '@backend/modules/admin/account/model.ts'
import type { QueueResponse } from '@backend/utils/saveQueueStatus.ts'
import { config } from '@backend/config.ts'
import { Drizzle, Schemas } from '@backend/db'
import { AccountService } from '@backend/modules/admin/account/service.ts'
import { saveQueueStatus } from '@backend/utils/saveQueueStatus.ts'
import { toChunks } from '@backend/utils/toChunks.ts'
import { Queue, Worker } from 'bullmq'
import { and, eq, sql } from 'drizzle-orm'
import { status } from 'elysia'

export interface CreateOrUpdateAccountJobData {
  user: TypeboxTypes['UserTypeboxSchemaType']
  body: AccountModelType['createAccountBody']
  isUpdate: boolean
}

export type CreateOrUpdateAccountQueueResponse = QueueResponse<{ id: number }>

export const createOrUpdateAccountQueue = new Queue<
  CreateOrUpdateAccountJobData,
  CreateOrUpdateAccountQueueResponse
>('createOrUpdateAccount', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    db: config.REDIS_DB,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 100,
  },
})

const worker = new Worker<CreateOrUpdateAccountJobData, CreateOrUpdateAccountQueueResponse>(
  'createOrUpdateAccount',
  async (job) => {
    const { user, body, isUpdate } = job.data

    await saveQueueStatus({
      job,
      progress: 10,
      status: 'processing',
      message: '获取账号信息中',
    })

    const _accountData = await AccountService.getAccountData(body.cookie, body.cid)
    if (_accountData.code !== 200) {
      return _accountData
    }

    const accountData = _accountData.response.data

    await saveQueueStatus({
      job,
      progress: 50,
      status: 'processing',
      message: isUpdate ? '更新账号中' : '创建账号中',
    })

    let account_id: number

    try {
      if (isUpdate) {
        const result = await Drizzle.update(Schemas.Account)
          .set({
            user_id: user.id,
            baidu_name:
              body.baidu_name !== '' ? body.baidu_name : accountData.account_info.baidu_name,
            uk: accountData.account_info.uk.toString(),
            cookie: body.cookie,
            bdstoken: accountData.template_variable.bdstoken,
            org_name: accountData.enterprise_info.orgInfo.name,
            cid: body.cid.toString(),
            ticket_remain_count: accountData.ticket_list.recent_remain_count,
          })
          .where(
            and(eq(Schemas.Account.user_id, user.id), eq(Schemas.Account.cid, body.cid.toString())),
          )
          .returning({ id: Schemas.Account.id })

        account_id = result[0]!.id
      } else {
        const result = await Drizzle.insert(Schemas.Account)
          .values({
            user_id: user.id,
            baidu_name:
              body.baidu_name !== '' ? body.baidu_name : accountData.account_info.baidu_name,
            uk: accountData.account_info.uk.toString(),
            cookie: body.cookie,
            bdstoken: accountData.template_variable.bdstoken,
            org_name: accountData.enterprise_info.orgInfo.name,
            cid: body.cid.toString(),
            ticket_remain_count: accountData.ticket_list.recent_remain_count,
          })
          .onConflictDoNothing({
            target: [Schemas.Account.user_id, Schemas.Account.cid],
          })
          .returning({ id: Schemas.Account.id })

        account_id = result[0]!.id
      }
    } catch {
      return status(500, {
        message: `${isUpdate ? '创建' : '更新'}账号失败: 数据库操作失败`,
        data: null,
      })
    }

    const insertData = accountData.sharelink_info.flatMap((link) => {
      const wx_list = accountData.wx_file_list[link.shareId]
      const share_info = accountData.bind_sharelink_list[link.shareId]

      if (!wx_list || !share_info) {
        // 使用了 flatMap 来过滤掉这些数据
        return []
      }

      return [
        {
          user_id: user.id,
          account_id,
          surl: link.shorturl,
          pwd: link.passwd,
          randsk: wx_list.seckey,
          shareid: link.shareId.toString(),
          uk: link.creator_uk.toString(),
          share_info,
          path: link.typicalPath,
          ctime: new Date(link.ctime * 1000),
        },
      ]
    })

    for (const chunk of toChunks(insertData, 500)) {
      // 创建分享链接相关
      await Drizzle.insert(Schemas.ShareLink)
        .values(chunk)
        .onConflictDoUpdate({
          target: [Schemas.ShareLink.surl, Schemas.ShareLink.shareid],
          set: {
            user_id: sql`EXCLUDED.user_id`,
            account_id: sql`EXCLUDED.account_id`,
            surl: sql`EXCLUDED.surl`,
            pwd: sql`EXCLUDED.pwd`,
            randsk: sql`EXCLUDED.randsk`,
            shareid: sql`EXCLUDED.shareid`,
            uk: sql`EXCLUDED.uk`,
            share_info: sql`EXCLUDED.share_info`,
            path: sql`EXCLUDED.path`,
            ctime: sql`EXCLUDED.ctime`,
          },
        })
    }

    return status(200, {
      message: '创建账号成功',
      data: {
        id: account_id,
      },
    })
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
    },
    concurrency: 1,
  },
)

worker.on('completed', async (job) => {
  const returnValue = job.returnvalue

  if (returnValue.code !== 200) {
    await saveQueueStatus({
      job,
      progress: 100,
      status: 'failed',
      message: returnValue.response.message,
      data: returnValue.response.data,
    })
    return
  }

  await saveQueueStatus({
    job,
    progress: 100,
    status: 'completed',
    message: returnValue.response.message,
    data: returnValue.response.data,
  })
})

worker.on('failed', async (job, err) => {
  if (!job) {
    return
  }

  await saveQueueStatus({
    job,
    progress: 100,
    status: 'failed',
    message: '创建账号失败, 请联系管理员',
  })

  console.error(`创建账号失败`)
  console.dir(job, { depth: null })
  console.log(err)
})
