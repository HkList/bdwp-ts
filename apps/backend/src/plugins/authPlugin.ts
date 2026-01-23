import { Drizzle } from '@backend/db'
import { redis } from '@backend/services/redis.ts'
import { bearer } from '@elysiajs/bearer'
import { Elysia, status } from 'elysia'

export function AuthPlugin() {
  return new Elysia({ name: 'auth' }).use(bearer()).derive({ as: 'scoped' }, async ({ bearer }) => {
    if (!bearer) {
      throw status(401, { message: '未提供令牌', data: null })
    }

    const userId = await redis.get(`auth:${bearer}`)
    if (!userId) {
      throw status(401, { message: '令牌无效', data: null })
    }

    const user = await Drizzle.query.User.findFirst({
      where: {
        id: Number(userId),
      },
    })

    if (!user) {
      throw status(401, { message: '令牌对应用户不存在', data: null })
    }

    return { user }
  })
}
