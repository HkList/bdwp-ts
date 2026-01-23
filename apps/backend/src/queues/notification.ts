import { config } from '@backend/config.ts'
import { Queue, Worker } from 'bullmq'

export interface EmailJobData {
  to: string
  subject: string
  body: string
}

export const emailQueue = new Queue<EmailJobData>('email', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
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

const worker = new Worker<EmailJobData>(
  'email',
  async (job) => {
    console.log('📩 正在处理发送邮件任务, ID:', job.id)
    console.log(job.data)

    // 模拟耗时任务
    await new Promise((res) => setTimeout(res, 1000))
  },
  {
    connection: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    },
    concurrency: 5,
  },
)

worker.on('completed', (job) => {
  console.log(`✅ 发送邮件任务 ${job.id} 完成`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ 发送邮件任务 ${job?.id} 失败`, err)
})
