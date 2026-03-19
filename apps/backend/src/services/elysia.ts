import path from 'node:path'
import process from 'node:process'
import { config } from '@backend/config.ts'
import {
  AccountModule,
  AuthModule,
  KeyModule,
  ParseModule,
  QrloginModule,
  ShareLinkModule,
  SmsLoginModule,
  TaskModule,
  UserModule,
} from '@backend/modules/index.ts'
import { KeyAuthPlugin } from '@backend/plugins/keyAuthPlugin.ts'
import { SpaPlugin } from '@backend/plugins/spaPlugin.ts'
import { UserAuthPlugin } from '@backend/plugins/userAuthPlugin.ts'
import { bearer } from '@elysiajs/bearer'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import packageJson from '@root/package.json' with { type: 'json' }
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { Elysia, ElysiaCustomStatusResponse, status } from 'elysia'

export const publicPath = path.join(process.cwd(), 'public')

export const app = new Elysia()
  .use(
    openapi({
      enabled: config.NODE_ENV === 'development',
      path: config.OPENAPI_PATH,
      documentation: {
        info: {
          title: 'bdwp-ts 后端 API 文档',
          version: packageJson.version,
          description: 'bdwp-ts 后端 API 文档',
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
      scalar: {
        authentication: {
          securitySchemes: {
            bearer: {
              // 固定的 token 值，实际应用中应该从配置中读取
              token: '8135bda0-2e08-4188-a711-e6c7950e3edd',
            },
          },
        },
      },
      exclude: {
        // 兼容 spaPlugin 的路由
        paths: ['/*'],
      },
    }),
  )
  .use(bearer())
  .use(cors())
  .use(
    SpaPlugin({
      dir: publicPath,
    }),
  )
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

    console.log('未知错误:', error)

    return status(500, {
      message: '服务器内部错误',
      data: { ...(config.NODE_ENV === 'development' ? { code, error } : null) },
    })
  })
  .group(
    '/api',
    app =>
      app
        .use(AuthModule)
        .use(TaskModule)
        .group(
          '/user',
          app =>
            app.use(KeyAuthPlugin())
              .use(ParseModule)
              .use(QrloginModule)
              .use(SmsLoginModule),
        )
        .group(
          '/admin',
          app =>
            app
              .use(UserAuthPlugin())
              .use(UserModule)
              .use(AccountModule)
              .use(KeyModule)
              .use(ShareLinkModule),
        ),
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
