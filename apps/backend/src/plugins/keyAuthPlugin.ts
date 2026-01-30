import { Drizzle } from '@backend/db'
import { Elysia, status } from 'elysia'

export function KeyAuthPlugin() {
  return new Elysia({ name: 'key_auth' }).derive({ as: 'scoped' }, async ({ query }) => {
    if (!query.key) {
      throw status(401, { message: '未提供卡密', data: null })
    }

    const key = await Drizzle.query.Key.findFirst({
      where: {
        key: query.key,
      },
    })

    if (!key) {
      throw status(404, { message: '卡密不存在', data: null })
    }

    return { key }
  })
}
