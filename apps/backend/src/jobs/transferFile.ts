import type { TypeboxTypes } from '@backend/db'
import type { ParseModelType } from '@backend/modules/user/parse/model.ts'

import type { JobResponse } from '@backend/utils/saveJobStatus.ts'
import type { Processor } from 'bullmq'
import path from 'node:path'
import { createFolder, getAccountInfo, getWxFileList, manageFile, transferFile } from '@backend/api'
import { config } from '@backend/config.ts'
import { Drizzle, Schemas } from '@backend/db'
import { redis } from '@backend/services/redis.ts'
import { verrou } from '@backend/services/verrou.ts'
import { saveJobStatus } from '@backend/utils/saveJobStatus.ts'
import { Queue as Job, Worker } from 'bullmq'
import dayjs from 'dayjs'
import { and, eq, gt, sql } from 'drizzle-orm'
import { status } from 'elysia'

export interface TransferFileJobData {
  key: TypeboxTypes['Key']
  body: ParseModelType['transferBody']
}

export type TransferFileJobRawResponse = null

export type TransferFileJobResponse = JobResponse<TransferFileJobRawResponse>

export const transferFileJob = new Job<
  TransferFileJobData,
  TransferFileJobResponse
>(
  'transferFile',
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 100,
    },
  },
)

const worker = new Worker<TransferFileJobData, TransferFileJobResponse>(
  'transferFile',
  async job => await transferFileWorker(job),
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
    },
    concurrency: 5,
  },
)

async function deleteEnterpriseFiles(cookie: string, cid: string, path: string) {
  await manageFile(
    'delete',
    {
      cookie,
      cid,
      filelist: [path],
    },
  )
}

const transferFileWorker: Processor<TransferFileJobData, TransferFileJobResponse, string> = async (job) => {
  const { key, body } = job.data

  const job_id = job.id
  if (!job_id) {
    return status(500, {
      message: '转存文件失败, 获取任务ID失败',
      data: null,
    })
  }

  const cookie = await redis.get(`cookie:${body.login_id}`)
  if (!cookie) {
    return status(500, {
      message: '转存文件失败: 登录状态无效, 请重新登录',
      data: null,
    })
  }

  const userInfo = await getAccountInfo({
    cookie,
  })
  if (userInfo.code !== 200) {
    return status(500, {
      message: '转存文件失败: 获取账号信息失败, 请重新登录',
      data: null,
    })
  }

  if (!key.user_data) {
    await Drizzle
      .update(Schemas.Key)
      .set({
        user_data: {
          ...userInfo.response.data,
          uk: userInfo.response.data.uk.toString(),
        },
      })
      .where(
        eq(Schemas.Key.id, key.id),
      )

    key.user_data = {
      ...userInfo.response.data,
      uk: userInfo.response.data.uk.toString(),
    }
  }

  if (key.user_data.uk !== userInfo.response.data.uk.toString()) {
    return status(500, {
      message: '转存文件失败: 当前登录账号与卡密绑定的账号不匹配, 请重新登录',
      data: null,
    })
  }

  await saveJobStatus({
    job_id,
    progress: 10,
    status: 'processing',
    message: '正在检查链接有效性',
  })

  // 检查链接是否有效
  const fileList = await getWxFileList({
    surl: body.surl,
    pwd: body.pwd,
    dir: body.dir,
  })
  if (fileList.code !== 200) {
    return fileList
  }
  // 检查fsId是否都存在
  if (!fileList.response.data.list.every(item => item.fs_id)) {
    return status(500, {
      message: '转存文件失败: 文件信息不完整, 请刷新页面重试',
      data: null,
    })
  }

  await saveJobStatus({
    job_id,
    progress: 20,
    status: 'processing',
    message: '正在获取卡密分享链接信息',
  })

  let share_link: TypeboxTypes['ShareLink'] | undefined
  if (key.share_link_id) {
    share_link = await Drizzle.query.ShareLink.findFirst({
      where: {
        id: key.share_link_id,
      },
    })
  }
  else {
    await saveJobStatus({
      job_id,
      progress: 25,
      status: 'processing',
      message: '正在为卡密绑定分享链接, 获取锁中',
    })

    const lock = verrou.createLock('transfer_file_get_sharelink', '1m')
    await lock.acquire()

    await saveJobStatus({
      job_id,
      progress: 30,
      status: 'processing',
      message: '正在为卡密绑定分享链接, 已获取锁',
    })

    try {
      // 查询是否有还未使用的分享链接
      ;[share_link] = await Drizzle
        .select()
        .from(Schemas.ShareLink)
        .where(
          and(
            gt(Schemas.ShareLink.ctime, dayjs().subtract(1, 'year').toDate()),
            sql`${Schemas.ShareLink.tkbind_list}::text LIKE ${`%\\\\"uk\\\\":${key.user_data.uk}%`}`,
          ),
        )
        .limit(1)

      if (!share_link) {
        ;[share_link] = await Drizzle
          .select()
          .from(Schemas.ShareLink)
          .where(
            and(
              eq(Schemas.ShareLink.use_count, 0),
              eq(Schemas.ShareLink.total_count, 1),
              gt(Schemas.ShareLink.ctime, dayjs().subtract(1, 'year').toDate()),
            ),
          )
          .limit(1)
      }

      if (!share_link) {
        return status(500, {
          message: '转存文件失败: 没有可用的分享链接, 请联系管理员',
          data: null,
        })
      }

      // 将这个分享链接的使用次数加1
      // 防止被其他进程占用同一个分享链接
      await Drizzle
        .update(Schemas.ShareLink)
        .set({
          use_count: share_link.use_count + 1,
        })
        .where(
          eq(Schemas.ShareLink.id, share_link.id),
        )
    }
    finally {
      if (await lock.isLocked()) {
        await lock.release()
      }
    }
  }

  if (!share_link) {
    return status(500, {
      message: '转存文件失败: 获取分享链接信息失败, 请联系管理员',
      data: null,
    })
  }

  // 判断分享链接是否过期
  if (dayjs(share_link.ctime).add(1, 'year').isBefore(dayjs())) {
    return status(500, {
      message: '转存文件失败: 分享链接已过期, 请联系管理员',
      data: null,
    })
  }

  // 更新卡密的过期时间
  if (!key.expired_at && key.total_hours !== 0) {
    await Drizzle
      .update(Schemas.Key)
      .set({
        expired_at: dayjs().add(key.total_hours, 'hour').toDate(),
      })
      .where(
        eq(Schemas.Key.id, key.id),
      )
  }

  const account = await Drizzle.query.Account.findFirst({
    where: {
      id: share_link.account_id,
    },
  })
  if (!account) {
    return status(500, {
      message: '转存文件失败: 获取账号信息失败, 请联系管理员',
      data: null,
    })
  }

  const savePath = path.posix.join(share_link.path, '/高速下载资源')

  await saveJobStatus({
    job_id,
    progress: 40,
    status: 'processing',
    message: '正在判断是否存在高速下载资源文件夹',
  })

  // 检查是否存在高速下载资源文件夹
  const checkFolderStatus = await getWxFileList({
    surl: share_link.surl,
    pwd: share_link.pwd,
    dir: savePath,
  })

  // 如果接口返回的错误信息不是路径错误, 则说明接口请求失败, 直接返回错误信息
  if (
    checkFolderStatus.code !== 200
    && !checkFolderStatus.response.message.includes('不存在此目录')
  ) {
    return checkFolderStatus
  }

  // 文件夹里有文件, 需要先清空
  if ((checkFolderStatus.response.data?.list?.length ?? 0) > 0) {
    await saveJobStatus({
      job_id,
      progress: 45,
      status: 'processing',
      message: '正在清空高速下载资源文件夹',
    })
    const manageFileStatus = await manageFile(
      'delete',
      {
        cookie: account.cookie,
        cid: account.cid,
        filelist: [savePath],
      },
    )
    if (manageFileStatus.code !== 200) {
      return manageFileStatus
    }
  }

  await saveJobStatus({
    job_id,
    progress: 55,
    status: 'processing',
    message: '正在创建高速下载资源文件夹',
  })

  const createFolderStatus = await createFolder({
    cookie: account.cookie,
    cid: account.cid,
    path: savePath,
  })
  if (createFolderStatus.code !== 200) {
    return createFolderStatus
  }

  await saveJobStatus({
    job_id,
    progress: 65,
    status: 'processing',
    message: '正在转存文件到高速下载资源文件夹',
  })

  const transferFileStatus = await transferFile({
    cookie: account.cookie,
    cid: account.cid,
    from: fileList.response.data.uk,
    fsidlist: body.fs_ids,
    path: savePath,
    sekey: fileList.response.data.seckey,
    shareid: fileList.response.data.shareid,
  })
  if (transferFileStatus.code !== 200) {
    await deleteEnterpriseFiles(account.cookie, account.cid, savePath)
    return transferFileStatus
  }

  await saveJobStatus({
    job_id,
    progress: 75,
    status: 'processing',
    message: '正在获取高速下载资源文件夹内的文件列表',
  })

  const ticketFileList = await getWxFileList({
    surl: share_link.surl,
    pwd: share_link.pwd,
    dir: savePath,
  })
  if (ticketFileList.code !== 200) {
    await deleteEnterpriseFiles(account.cookie, account.cid, savePath)
    return ticketFileList
  }

  // 转存到用户盘内
  await saveJobStatus({
    job_id,
    progress: 85,
    status: 'processing',
    message: '正在转存文件到用户盘',
  })
  const transferUserFileStatus = await transferFile({
    cookie,
    from: ticketFileList.response.data.uk,
    fsidlist: ticketFileList.response.data.list.map(item => item.fs_id),
    path: '/高速下载资源',
    sekey: ticketFileList.response.data.seckey,
    shareid: ticketFileList.response.data.shareid,
  })
  if (transferUserFileStatus.code !== 200) {
    await deleteEnterpriseFiles(account.cookie, account.cid, savePath)
    return transferUserFileStatus
  }

  await deleteEnterpriseFiles(account.cookie, account.cid, savePath)

  if (key.total_count !== 0) {
    await Drizzle
      .update(Schemas.Key)
      .set({
        used_count: key.used_count + 1,
      })
      .where(
        eq(Schemas.Key.id, key.id),
      )
  }

  return status(200, {
    message: `转存文件成功`,
    data: null,
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
    message: '转存文件失败, 请联系管理员',
  })

  console.error(`转存文件失败`)
  console.dir(job, { depth: null })
  console.log(err)
})
