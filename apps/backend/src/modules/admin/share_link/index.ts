import { ShareLinkModel } from '@backend/modules/admin/share_link/model.ts'
import { ShareLinkService } from '@backend/modules/admin/share_link/service.ts'
import { UserAuthPlugin } from '@backend/plugins/userAuthPlugin.ts'
import { Elysia } from 'elysia'

export const ShareLinkModule = new Elysia({ prefix: '/share_links' })
  .use(UserAuthPlugin())
  .get('/', async ({ user, query }) => await ShareLinkService.getAllShareLinks(user, query), {
    query: ShareLinkModel.getAllShareLinksQuery,
    response: {
      200: ShareLinkModel.getAllShareLinksSuccess,
    },
    detail: {
      summary: '获取所有分享链接',
      tags: ['分享链接管理'],
    },
  })
