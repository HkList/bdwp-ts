import type { TypeboxTypes } from '@backend/db'
import type { KeyModelType } from '@backend/modules/admin/key/model.ts'
import type { QueueResponse } from '@backend/utils/saveQueueStatus.ts'

import { createShareLinkWithAutoMakePath, getEnterpriseShareBindList, getWxFileList } from '@backend/api'
import { config } from '@backend/config.ts'
import { Drizzle, Schemas } from '@backend/db'
import { randomString } from '@backend/utils/randomString.ts'
import { saveQueueStatus } from '@backend/utils/saveQueueStatus.ts'
import { toChunks } from '@backend/utils/toChunks.ts'
import { Queue, Worker } from 'bullmq'
import { and, eq, inArray } from 'drizzle-orm'
import { status } from 'elysia'

export interface CreateKeyJobData {
  user: TypeboxTypes['User']
  body: KeyModelType['createKeyBody']
}

export interface CreateKeyFailedItem {
  reason: string
  key: string
}

export interface CreateKeyQueueRawResponse {
  keys: string[]
  failed_keys: CreateKeyFailedItem[]
}

export type CreateKeyQueueResponse = QueueResponse<{ keys: string[], failed_keys: CreateKeyFailedItem[] }>

export const createKeyQueue = new Queue<
  CreateKeyJobData,
  CreateKeyQueueResponse
>('createKey', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    db: config.REDIS_DB,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
  },
})

const worker = new Worker<CreateKeyJobData, CreateKeyQueueResponse>(
  'createKey',
  async (job) => {
    const { user, body } = job.data
    const { account_id, keys, total_count, total_hours } = body

    const accounts = await Drizzle.select()
      .from(Schemas.Account)
      .where(and(eq(Schemas.Account.user_id, user.id), eq(Schemas.Account.id, account_id)))
      .limit(1)

    if (!accounts.length || !accounts[0]) {
      return status(500, {
        message: '账号不存在',
        data: null,
      })
    }

    if (keys.length > accounts[0].ticket_remain_count) {
      return status(500, {
        message: '卡密数量超过账号剩余下载卷数量',
        data: null,
      })
    }

    await saveQueueStatus({
      job,
      progress: 10,
      status: 'processing',
      message: '正在过滤失效卡密',
    })

    const filted_keys = keys.map(key => key.trim()).filter(key => key.length > 0)

    const existing_keys = await Drizzle.select({ key: Schemas.Key.key })
      .from(Schemas.Key)
      .where(and(eq(Schemas.Key.account_id, account_id), inArray(Schemas.Key.key, filted_keys)))

    const filted_keys_set = new Set(filted_keys)
    const existing_keys_set = new Set(existing_keys.map(k => k.key))

    const not_exist_key = filted_keys_set.difference(existing_keys_set)

    await saveQueueStatus({
      job,
      progress: 15,
      status: 'processing',
      message: '开始创建卡密和分享链接',
    })

    const account = accounts[0]
    const inserted_keys: string[] = []
    const insert_failed_keys: CreateKeyFailedItem[] = []
    const promises = []

    let progress = 0
    const progressStep = (100 - 15) / not_exist_key.size

    for (const key of not_exist_key) {
      promises.push((async () => {
        // 创建分享链接
        const pwd = randomString(4)
        const createShareLinkRes = await createShareLinkWithAutoMakePath({
          cid: account.cid,
          cookie: account.cookie,
          period: 0,
          pwd,
          ticket_count: 0,
        })
        // 如果创建分享链接失败, 跳过
        if (createShareLinkRes.code !== 200) {
          return { res: createShareLinkRes, key }
        }
        const createShareLinkData = createShareLinkRes.response.data

        const surl = createShareLinkData.shorturl.split('/s/')[1]
        if (!surl) {
          return {
            res: status(500, {
              message: '解析分享链接失败: 提取surl失败',
              data: null,
            }),
            key,
          }
        }

        const shareInfoRes = await getWxFileList({
          surl,
          pwd,
          dir: '/',
        })
        if (shareInfoRes.code !== 200) {
          return { res: shareInfoRes, key }
        }
        const shareInfoData = shareInfoRes.response.data

        const bindListRes = await getEnterpriseShareBindList({
          cookie: account.cookie,
          cid: account.cid,
          shareid: createShareLinkData.shareid.toString(),
        })
        if (bindListRes.code !== 200) {
          return { res: bindListRes, key }
        }
        const bindListData = bindListRes.response.data

        // 插入数据库
        await Drizzle.insert(Schemas.ShareLink)
          .values({
            user_id: user.id,
            account_id: account.id,
            surl,
            pwd,
            randsk: shareInfoData.seckey,
            shareid: createShareLinkData.shareid.toString(),
            uk: account.uk,
            share_info: bindListData,
            path: createShareLinkData.path,
            ctime: new Date(createShareLinkData.ctime * 1000),
          })

        await Drizzle.insert(Schemas.Key)
          .values({
            user_id: user.id,
            account_id: account.id,
            key,
            total_count,
            total_hours,
          })

        inserted_keys.push(key)

        progress += progressStep
        await saveQueueStatus({
          job,
          progress,
          status: 'processing',
          message: `正在创建卡密: ${key}`,
        })
      })())
    }

    for (const chunkedPromise of toChunks(promises, 5)) {
      const result = await Promise.all(chunkedPromise)
      result.forEach((item) => {
        if (item && item.res) {
          insert_failed_keys.push({ reason: item.res.response.message, key: item.key })
        }
      })
    }

    return status(200, {
      message: `创建卡密成功`,
      data: {
        keys: inserted_keys,
        failed_keys: insert_failed_keys,
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

worker.on('active', async (job) => {
  await saveQueueStatus({
    job,
    progress: 0,
    status: 'processing',
    message: '任务已启动, 正在准备中',
  })
})

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
    message: '创建卡密失败, 请联系管理员',
  })

  console.error(`创建卡密失败`)
  console.dir(job, { depth: null })
  console.log(err)
})
