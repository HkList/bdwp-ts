import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import { Drizzle, Schemas } from '@backend/db'
import { count, eq, inArray } from 'drizzle-orm'
import { status } from 'elysia'

export class UserService {
  static async createUser(body: UserModelType['createUserBody']) {
    const { username, password, confirm_password } = body
    if (password !== confirm_password) {
      return status(400, {
        message: '两次输入的密码不一致',
        data: null,
      })
    }

    try {
      const [insertedUser] = await Drizzle.insert(Schemas.User)
        .values({
          username,
          password: await Bun.password.hash(password),
        })
        .returning({ id: Schemas.User.id })

      return status(200, {
        message: '创建用户成功',
        data: {
          id: insertedUser!.id,
        },
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        return status(409, {
          message: '用户名已存在',
          data: null,
        })
      }

      throw error
    }
  }

  static async deleteUserById(id: number) {
    const deleted = await Drizzle.delete(Schemas.User)
      .where(eq(Schemas.User.id, id))
      .returning({ id: Schemas.User.id })

    if (deleted.length === 0) {
      return status(404, {
        message: '用户不存在',
        data: null,
      })
    }

    return status(200, {
      message: '删除用户成功',
      data: null,
    })
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
      throw error
    }

    return status(200, {
      message: '删除用户成功',
      data: null,
    })
  }

  static async updateUserById(id: number, body: UserModelType['updateUserByIdBody']) {
    if (body.password) {
      body.password = await Bun.password.hash(body.password)
    }

    try {
      const updated = await Drizzle.update(Schemas.User)
        .set(body)
        .where(eq(Schemas.User.id, id))
        .returning({ id: Schemas.User.id })

      if (updated.length === 0) {
        return status(404, {
          message: '用户不存在',
          data: null,
        })
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        return status(409, {
          message: '用户名已存在',
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
            if (error instanceof Error && error.message.includes('UNIQUE')) {
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
      message: '批量更新用户信息成功',
      data: null,
    })
  }

  static async getAllUsers(query: UserModelType['getAllUsersQuery']) {
    const page = query.page ?? 1
    const page_size = query.page_size ?? 10

    const [users, total] = await Promise.all([
      Drizzle.query.User.findMany({
        limit: page_size,
        offset: (page - 1) * page_size,
      }),
      Drizzle.select({ count: count() }).from(Schemas.User),
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

  static async getUserById(id: number) {
    const user = await Drizzle.query.User.findFirst({
      where: {
        id,
      },
    })

    if (!user) {
      return status(404, {
        message: '用户不存在',
        data: null,
      })
    }

    return status(200, {
      message: '获取用户信息成功',
      data: user,
    })
  }
}
