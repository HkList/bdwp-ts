import { config } from '@backend/config.ts'
import { AuthModule, UserModule } from '@backend/modules/index.ts'
import { AuthPlugin } from '@backend/plugins/authPlugin.ts'
import { bearer } from '@elysiajs/bearer'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { Elysia, ElysiaCustomStatusResponse, status } from 'elysia'

export const app = new Elysia()
  .use(
    swagger({
      path: config.OPENAPI_PATH,
      documentation: {
        info: {
          title: 'vue-elysia',
          version: '1.0.0',
          description: 'vue-elysia API 文档',
        },
        security: [{ bearer: [] }],
        components: {
          securitySchemes: {
            bearer: {
              type: 'http',
              scheme: 'bearer',
            },
          },
        },
      },
    }),
  )
  .use(bearer())
  .use(cors())
  .use(staticPlugin())
  .onError((context) => {
    const { code, error } = context

    if (error instanceof ElysiaCustomStatusResponse) {
      // 补充 data 为 null
      if (!error.response.data) {
        error.response.data = null
      }
      return error
    }

    if (code === 'VALIDATION') {
      if (error.type === 'response') {
        return status(422, {
          message: `后端返回数据校验未通过, 请联系管理员`,
          data: {
            ...(config.NODE_ENV === 'development' ? { errors: error.all } : null),
            type: error.type,
          },
        })
      }

      return status(422, {
        message: `请求参数校验未通过`,
        data: {
          ...(config.NODE_ENV === 'development' ? { errors: error.all } : null),
          type: error.type,
        },
      })
    }

    if (code === 'NOT_FOUND') {
      return status(404, { message: '页面没有找到', data: null })
    }

    if (code === 'PARSE') {
      return status(400, { message: '参数解析错误', data: null })
    }

    if (error instanceof DrizzleQueryError) {
      return status(500, {
        message: '数据库错误',
        data: { ...(config.NODE_ENV === 'development' ? { code, error } : null) },
      })
    }

    return status(500, {
      message: '服务器内部错误',
      data: { ...(config.NODE_ENV === 'development' ? { code, error } : null) },
    })
  })
  .group('/api', (app) =>
    app.use(AuthModule).group('/admin', (app) => app.use(AuthPlugin()).use(UserModule)),
  )

export type App = typeof app

export async function initElysia() {
  return new Promise<void>((resolve) => {
    app.listen(config.APP_PORT, () => {
      console.log(`🦊 Elysia成功启动在 ${app.server?.url.origin}`)
      resolve()
    })
  })
}
