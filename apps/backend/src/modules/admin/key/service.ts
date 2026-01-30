import type { TypeboxTypes } from '@backend/db'
import type { KeyModelType } from '@backend/modules/admin/key/model.ts'
import { Drizzle, Schemas } from '@backend/db'
import { toChunks } from '@backend/utils/toChunks.ts'
import { and, count, eq, inArray } from 'drizzle-orm'
import { status } from 'elysia'

export class KeyService {
  static async createKey(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    body: KeyModelType['createKeyBody'],
  ) {
    const { account_id, keys, total_count, total_hours } = body

    const account = await Drizzle.select({ id: Schemas.Account.id })
      .from(Schemas.Account)
      .where(eq(Schemas.Account.id, account_id))
      .limit(1)

    if (!account.length) {
      return status(404, {
        message: '账号不存在',
        data: null,
      })
    }

    const chunks = keys.map((key) => ({
      user_id: user.id,
      account_id,
      key,
      total_count,
      total_hours,
    }))

    const inserted_keys: string[] = []

    for (const chunk of toChunks(chunks, 100)) {
      const inserted = await Drizzle.insert(Schemas.Key)
        .values(chunk)
        .onConflictDoNothing({
          target: [Schemas.Key.key],
        })
        .returning({ key: Schemas.Key.key })

      inserted_keys.push(...inserted.map((item) => item.key))
    }

    return status(201, {
      message: '创建卡密成功',
      data: {
        inserted_keys,
      },
    })
  }

  static async deleteKeys(
    user: TypeboxTypes['UserTypeboxSchemaType'],
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
    } catch (error) {
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

  static async updateKeys(body: KeyModelType['updateKeysBody']) {
    const ids = body.map((key) => key.id)

    const existingKeys = await Drizzle.select({
      id: Schemas.Key.id,
    })
      .from(Schemas.Key)
      .where(inArray(Schemas.Key.id, ids))

    if (existingKeys.length !== ids.length) {
      return status(404, {
        message: '部分卡密不存在, 更新失败',
        data: null,
      })
    }

    await Drizzle.transaction(async (tx) => {
      for (const item of body) {
        await tx
          .update(Schemas.Key)
          .set({
            ...item,
            expired_at: item.expired_at ? new Date(item.expired_at) : undefined,
          })
          .where(eq(Schemas.Key.id, item.id))
      }
    })

    return status(201, {
      message: '更新卡密信息成功',
      data: null,
    })
  }

  static async getAllKeys(
    user: TypeboxTypes['UserTypeboxSchemaType'],
    query: KeyModelType['getAllKeysQuery'],
  ) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10
    const { id, account_id, status: keyStatus } = query

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
