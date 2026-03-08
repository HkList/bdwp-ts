import type { TypeboxTypes } from '@backend/db'
import type { ParseModelType } from '@backend/modules/user/parse/model.ts'
import { getWxFileList } from '@backend/api'
import { Drizzle } from '@backend/db'
import { transferFileJob } from '@backend/jobs/transferFile.ts'
import { status } from 'elysia'

export class ParseService {
  static async getKeyInfo({ key }: ParseModelType['getKeyInfoQuery']) {
    const res = await Drizzle.query.Key.findFirst({
      where: {
        key,
      },
    })

    if (!res) {
      return status(404, {
        message: '密钥不存在',
        data: null,
      })
    }

    return status(200, {
      message: '获取成功',
      data: {
        user_data: res.user_data,
        key: res.key,
        used_count: res.used_count,
        total_count: res.total_count,
        expired_at: res.expired_at,
        total_hours: res.total_hours,
        status: res.status,
        reason: res.reason,
      },
    })
  }

  static async getList(query: ParseModelType['getListQuery']) {
    const res = await getWxFileList(query)

    if (res.code !== 200) {
      return status(500, {
        message: res.response.message,
        data: null,
      })
    }

    return status(200, res.response)
  }

  static async transfer(key: TypeboxTypes['Key'], body: ParseModelType['transferBody']) {
    const job = await transferFileJob.add(
      'transferFile',
      {
        key,
        body,
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
}
