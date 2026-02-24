import type { TypeboxTypes } from '@backend/db'
import type { ShareLinkModelType } from '@backend/modules/admin/share_link/model.ts'
import { getWxFileList } from '@backend/api'
import { Drizzle, Schemas } from '@backend/db'
import { isReferenceError } from '@backend/utils/errorCheckers.ts'
import { toChunks } from '@backend/utils/toChunks.ts'
import { and, count, eq, inArray } from 'drizzle-orm'
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
        data: shareLinks,
      },
    })
  }

  static async getNotValidShareLinkIds(shareLinks: TypeboxTypes['ShareLink'][], force: boolean) {
    if (force) {
      return shareLinks.map(link => link.id)
    }

    const notValidShareLinkIds: number[] = []
    const promise: Promise<void>[] = []

    shareLinks.forEach((shareLink) => {
      promise.push((async () => {
        // 查询分享链接状态
        const res = await getWxFileList({
          surl: shareLink.surl,
          pwd: shareLink.pwd,
          dir: '/',
        })

        console.log(`分享链接 ${shareLink.id} 状态:`, res)

        if (res.code !== 200) {
          notValidShareLinkIds.push(shareLink.id)
        }
      })())
    })

    for (const chunk of toChunks(promise, 5)) {
      await Promise.all(chunk)
    }

    return notValidShareLinkIds
  }

  static async deleteShareLink(user: TypeboxTypes['User'], body: ShareLinkModelType['deleteShareLinkBody']) {
    const { ids, force = false } = body

    const shareLinks = await Drizzle
      .select()
      .from(Schemas.ShareLink)
      .where(and(eq(Schemas.ShareLink.user_id, user.id), inArray(Schemas.ShareLink.id, ids)))

    if (shareLinks.length !== ids.length) {
      return status(404, {
        message: '部分分享链接不存在, 删除失败',
        data: null,
      })
    }

    try {
      await Drizzle.transaction(async (tx) => {
        // 如果不是强制删除，先检查分享链接是否有效, 如果有效就不删除
        const notValidShareLinkIds = await this.getNotValidShareLinkIds(shareLinks, force)

        const rows = await tx
          .delete(Schemas.ShareLink)
          .where(and(eq(Schemas.ShareLink.user_id, user.id), inArray(Schemas.ShareLink.id, notValidShareLinkIds)))
          .returning({ id: Schemas.ShareLink.id })

        return rows
      })
    }
    catch (error) {
      if (isReferenceError(error)) {
        return status(409, {
          message: '分享链接存在关联数据, 无法删除',
          data: null,
        })
      }

      throw error
    }

    return status(200, {
      message: '删除分享链接成功',
      data: null,
    })
  }
}
