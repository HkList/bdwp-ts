import type { TypeboxTypes } from '@backend/db'
import type { ShareLinkModelType } from '@backend/modules/admin/share_link/model.ts'
import { Drizzle, Schemas } from '@backend/db'
import { and, count, eq } from 'drizzle-orm'
import { status } from 'elysia'

export class ShareLinkService {
  static async getAllShareLinks(
    user: TypeboxTypes['User'],
    query: ShareLinkModelType['getAllShareLinksQuery'],
  ) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10
    const { id, account_id } = query

    // 构建查询条件
    const conditions = [eq(Schemas.ShareLink.user_id, user.id)]

    if (id) {
      conditions.push(eq(Schemas.ShareLink.id, id))
    }

    if (account_id) {
      conditions.push(eq(Schemas.ShareLink.account_id, account_id))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [shareLinks, total] = await Promise.all([
      Drizzle.select()
        .from(Schemas.ShareLink)
        .limit(page_size)
        .offset((page - 1) * page_size)
        .where(where),
      Drizzle.select({ count: count() }).from(Schemas.ShareLink).where(where),
    ])

    return status(200, {
      message: '获取分享链接列表成功',
      data: {
        page,
        page_size,
        total: total[0]!.count,
        data: shareLinks as TypeboxTypes['ShareLink'][],
      },
    })
  }
}
