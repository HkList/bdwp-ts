import type { TypeboxTypes } from '@backend/db'
import type { KeyModelType } from '@backend/modules/admin/key/model.ts'
import type { JobResponse } from '@backend/utils/saveJobStatus.ts'

import type { Processor } from 'bullmq'
import { createShareLinkWithAutoMakePath, getEnterpriseShareBindList, getWxFileList } from '@backend/api'
import { config } from '@backend/config.ts'
import { Drizzle, Schemas } from '@backend/db'
import { verrou } from '@backend/services/verrou.ts'
import { randomString } from '@backend/utils/randomString.ts'
import { saveJobStatus } from '@backend/utils/saveJobStatus.ts'
import { toChunks } from '@backend/utils/toChunks.ts'
import { Queue as Job, Worker } from 'bullmq'
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

export interface CreateKeyJobRawResponse {
  keys: string[]
  failed_keys: CreateKeyFailedItem[]
}

export type CreateKeyJobResponse = JobResponse<CreateKeyJobRawResponse>

export const createKeyJob = new Job<
  CreateKeyJobData,
  CreateKeyJobResponse
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

const worker = new Worker<CreateKeyJobData, CreateKeyJobResponse>(
  'createKey',
  async (job) => {
    // 上锁
    const lock = verrou.createLock(`create_key_lock:${job.data.body.account_id}`, '5m')
    await lock.acquire()

    try {
      return await createKeyWorker(job)
    }
    finally {
      if (await lock.isLocked()) {
        await lock.release()
      }
    }
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
    },
    concurrency: 5,
  },
)

const createKeyWorker: Processor<CreateKeyJobData, CreateKeyJobResponse, string> = async (job) => {
  const { user, body } = job.data
  const { account_id, keys, total_count, total_hours, disable_create_share_link } = body
  const job_id = job.id
  if (!job_id) {
    return status(500, {
      message: '创建卡密失败, 获取任务ID失败',
      data: null,
    })
  }

  const account = await Drizzle.query.Account.findFirst({
    where: {
      user_id: user.id,
      id: account_id,
    },
  })

  if (!account) {
    return status(500, {
      message: '账号不存在',
      data: null,
    })
  }
  if (keys.length > account.ticket_remain_count) {
    return status(500, {
      message: '卡密数量超过账号剩余下载卷数量',
      data: null,
    })
  }

  await saveJobStatus({
    job_id,
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

  await saveJobStatus({
    job_id,
    progress: 15,
    status: 'processing',
    message: '开始创建卡密和分享链接',
  })

  const inserted_keys: string[] = []
  const insert_failed_keys: CreateKeyFailedItem[] = []
  const promises = []

  let progress = 0
  const progressStep = (100 - 15) / not_exist_key.size

  for (const key of not_exist_key) {
    promises.push((async () => {
      // 判断是否需要自动创建分享链接并填充一张下载卷
      if (!disable_create_share_link) {
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
            use_count: bindListData.use_count,
            total_count: bindListData.total_count,
            tkbind_list: bindListData.tkbind_list,
            path: createShareLinkData.path,
            ctime: new Date(createShareLinkData.ctime * 1000),
          })
      }

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
      await saveJobStatus({
        job_id,
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
}

worker.on('active', async (job) => {
  const job_id = job.id ?? ''

  await saveJobStatus({
    job_id,
    progress: 0,
    status: 'processing',
    message: '任务已启动, 正在准备中',
  })
})

worker.on('completed', async (job) => {
  const returnValue = job.returnvalue
  const job_id = job.id ?? ''

  if (returnValue.code !== 200) {
    await saveJobStatus({
      job_id,
      progress: 100,
      status: 'failed',
      message: returnValue.response.message,
      data: returnValue.response.data,
    })
    return
  }

  await saveJobStatus({
    job_id,
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
  const job_id = job.id ?? ''

  await saveJobStatus({
    job_id,
    progress: 100,
    status: 'failed',
    message: '创建卡密失败, 请联系管理员',
  })

  console.error(`创建卡密失败`)
  console.dir(job, { depth: null })
  console.log(err)
})
