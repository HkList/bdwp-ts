import type { TypeboxTypes } from '@backend/db'
import type { KeyModelType } from '@backend/modules/admin/key/model.ts'
import { Drizzle, Schemas } from '@backend/db'
import { createKeyQueue } from '@backend/queues/createKeys.ts'
import { and, count, eq, inArray, like } from 'drizzle-orm'
import { status } from 'elysia'

export class KeyService {
  static async createKey(
    user: TypeboxTypes['User'],
    body: KeyModelType['createKeyBody'],
  ) {
    const { account_id, keys } = body

    const account = await Drizzle.query.Account.findFirst({
      where: {
        user_id: user.id,
        id: account_id,
      },
    })

    if (!account) {
      return status(404, {
        message: '账号不存在',
        data: null,
      })
    }

    if (keys.length > account.ticket_remain_count) {
      return status(409, {
        message: '卡密数量超过账号剩余下载卷数量',
        data: null,
      })
    }

    const job = await createKeyQueue.add(
      'createKey',
      {
        user,
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

  static async deleteKeys(
    user: TypeboxTypes['User'],
    body: KeyModelType['deleteKeysBody'],
  ) {
    const { ids } = body

    try {
      await Drizzle.transaction(async (tx) => {
        const rows = await tx
          .delete(Schemas.Key)
          .where(and(eq(Schemas.Key.user_id, user.id), inArray(Schemas.Key.id, ids)))
          .returning({ id: Schemas.Key.id })

        if (rows.length !== ids.length) {
          throw new Error('IDS_NOT_ALL_FOUND')
        }

        return rows
      })
    }
    catch (error) {
      if (error instanceof Error && error.message === 'IDS_NOT_ALL_FOUND') {
        return status(404, {
          message: '部分卡密不存在, 删除失败',
          data: null,
        })
      }
      throw error
    }

    return status(200, {
      message: '删除卡密成功',
      data: null,
    })
  }

  static async updateKeys(user: TypeboxTypes['User'], body: KeyModelType['updateKeysBody']) {
    const ids = body.map(key => key.id)

    const existingKeys = await Drizzle.select({
      id: Schemas.Key.id,
    })
      .from(Schemas.Key)
      .where(and(eq(Schemas.Key.user_id, user.id), inArray(Schemas.Key.id, ids)))

    if (existingKeys.length !== ids.length) {
      return status(404, {
        message: '部分卡密不存在, 更新失败',
        data: null,
      })
    }

    // 判断share_link_id是否存在且属于当前用户
    const validShareLinkIds = body.map(key => key.share_link_id).filter(Boolean) as number[]
    const shareLink = await Drizzle.select({ count: count() })
      .from(Schemas.ShareLink)
      .where(
        and(
          eq(Schemas.ShareLink.user_id, user.id),
          inArray(Schemas.ShareLink.id, validShareLinkIds),
        ),
      )

    if (!shareLink[0] || shareLink[0].count !== validShareLinkIds.length) {
      return status(404, {
        message: `部分分享链接不存在, 更新失败`,
        data: null,
      })
    }

    await Drizzle.transaction(async (tx) => {
      for (const item of body) {
        await tx
          .update(Schemas.Key)
          .set({
            key: item.key,
            used_count: item.used_count,
            total_count: item.total_count,
            expired_at: item.expired_at ? new Date(item.expired_at) : null,
            total_hours: item.total_hours,
            status: item.status,
            reason: item.reason,
            share_link_id: item.share_link_id,
          })
          .where(
            and(
              eq(Schemas.Key.user_id, user.id),
              eq(Schemas.Key.id, item.id),
            ),
          )
      }
    })

    return status(200, {
      message: '更新卡密信息成功',
      data: null,
    })
  }

  static async getAllKeys(
    user: TypeboxTypes['User'],
    query: KeyModelType['getAllKeysQuery'],
  ) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10
    const { id, account_id, status: keyStatus, key } = query

    // 构建查询条件
    const conditions = [eq(Schemas.Key.user_id, user.id)]

    if (id) {
      conditions.push(eq(Schemas.Key.id, id))
    }

    if (account_id) {
      conditions.push(eq(Schemas.Key.account_id, account_id))
    }

    if (keyStatus) {
      conditions.push(eq(Schemas.Key.status, keyStatus))
    }

    if (key) {
      conditions.push(like(Schemas.Key.key, `%${key}%`))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [keys, total] = await Promise.all([
      Drizzle.select()
        .from(Schemas.Key)
        .limit(page_size)
        .offset((page - 1) * page_size)
        .where(where),
      Drizzle.select({ count: count() }).from(Schemas.Key).where(where),
    ])

    return status(200, {
      message: '获取卡密列表成功',
      data: {
        page,
        page_size,
        total: total[0]!.count,
        data: keys,
      },
    })
  }
}
