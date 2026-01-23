import type { TypeboxTypes } from '@backend/db'
import type { AuthModelType } from '@backend/modules/auth/model.ts'
import crypto from 'node:crypto'
import { Drizzle } from '@backend/db'
import { redis } from '@backend/services/redis.ts'
import { status } from 'elysia'

export class AuthService {
  static async generateToken(user_id: number, rember_me: boolean) {
    const token = crypto.randomUUID()
    await redis.set(`auth:${token}`, user_id, 'EX', 60 * 60 * 24 * (rember_me ? 31 : 7))

    // 保存用户的token列表
    const list = (await redis.get(`auth:${user_id}`)) ?? '[]'
    const tokenList = JSON.parse(list) as string[]
    tokenList.push(token)
    await redis.set(`auth:${user_id}`, JSON.stringify(tokenList), 'EX', 60 * 60 * 24 * 31)

    return token
  }

  static async signIn({ username, password, remember_me }: AuthModelType['signInBody']) {
    const user = await Drizzle.query.User.findFirst({
      where: {
        username,
      },
    })

    if (!user) {
      return status(404, {
        message: '账号不存在',
        data: null,
      })
    }

    if (!(await Bun.password.verify(user.password, password))) {
      return status(401, {
        message: '密码错误',
        data: null,
      })
    }

    const token = await this.generateToken(user.id, remember_me)

    return status(200, {
      message: '登录成功',
      data: {
        token,
      },
    })
  }

  static async signOut(user: TypeboxTypes['UserTypeboxSchemaType']) {
    // 删除所有token
    const list = (await redis.get(`auth:${user.id}`)) ?? '[]'
    const tokenList = JSON.parse(list) as string[]
    for (const token of tokenList) {
      await redis.del(`auth:${token}`)
    }
    await redis.del(`auth:${user.id}`)

    return status(200, {
      message: '登出成功',
      data: null,
    })
  }
}
