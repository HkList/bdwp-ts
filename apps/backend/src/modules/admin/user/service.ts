import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import { Drizzle, Schemas } from '@backend/db'
import { isDuplicateError, isReferenceError } from '@backend/utils/errorCheckers.ts'
import { and, count, eq, inArray, like } from 'drizzle-orm'
import { status } from 'elysia'

export class UserService {
  static async createUser(body: UserModelType['createUserBody']) {
    const { username, password } = body

    try {
      const [insertedUser] = await Drizzle.insert(Schemas.User)
        .values({
          username,
          password: await Bun.password.hash(password),
        })
        .returning({ id: Schemas.User.id })

      return status(201, {
        message: '创建用户成功',
        data: {
          id: insertedUser!.id,
        },
      })
    } catch (error) {
      console.error('创建用户失败:', error)

      if (isDuplicateError(error)) {
        return status(409, {
          message: '用户名已存在',
          data: null,
        })
      }

      throw error
    }
  }

  static async deleteUsers(body: UserModelType['deleteUsersBody']) {
    const { ids } = body

    try {
      await Drizzle.transaction(async (tx) => {
        const rows = await tx
          .delete(Schemas.User)
          .where(inArray(Schemas.User.id, ids))
          .returning({ id: Schemas.User.id })

        if (rows.length !== ids.length) {
          throw new Error('IDS_NOT_ALL_FOUND')
        }

        return rows
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'IDS_NOT_ALL_FOUND') {
        return status(404, {
          message: '部分用户不存在, 删除失败',
          data: null,
        })
      }

      if (isReferenceError(error)) {
        return status(500, {
          message: '用户无法删除, 存在绑定的数据, 请先删除相关数据',
          data: null,
        })
      }

      throw error
    }

    return status(200, {
      message: '删除用户成功',
      data: null,
    })
  }

  static async updateUsers(body: UserModelType['updateUsersBody']) {
    const ids = body.map((user) => user.id)

    const existingUsers = await Drizzle.select({
      id: Schemas.User.id,
      username: Schemas.User.username,
    })
      .from(Schemas.User)
      .where(inArray(Schemas.User.id, ids))

    if (existingUsers.length !== ids.length) {
      return status(404, {
        message: '部分用户不存在, 更新失败',
        data: null,
      })
    }

    try {
      await Drizzle.transaction(async (tx) => {
        for (const item of body) {
          try {
            await tx
              .update(Schemas.User)
              .set({
                ...(item.username ? { username: item.username } : {}),
                ...(item.password ? { password: await Bun.password.hash(item.password) } : {}),
              })
              .where(eq(Schemas.User.id, item.id))
          } catch (error) {
            if (isDuplicateError(error)) {
              throw new Error('USERNAME_EXISTS')
            }

            throw error
          }
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message === 'USERNAME_EXISTS') {
        return status(409, {
          message: '部分用户名已存在, 更新失败',
          data: null,
        })
      }

      throw error
    }

    return status(200, {
      message: '更新用户信息成功',
      data: null,
    })
  }

  static async getAllUsers(query: UserModelType['getAllUsersQuery']) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10
    const user_id = query.id
    const username = query.username

    const where = and(
      user_id ? eq(Schemas.User.id, user_id) : undefined,
      username ? like(Schemas.User.username, `%${username}%`) : undefined,
    )

    const [users, total] = await Promise.all([
      Drizzle.select()
        .from(Schemas.User)
        .limit(page_size)
        .offset((page - 1) * page_size)
        .where(where),
      Drizzle.select({ count: count() }).from(Schemas.User).where(where),
    ])

    return status(200, {
      message: '获取用户列表成功',
      data: {
        page,
        page_size,
        total: total[0]!.count,
        data: users,
      },
    })
  }
}
