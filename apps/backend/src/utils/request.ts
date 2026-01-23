import type { KyInstance, Options } from 'ky'
import ky, { HTTPError } from 'ky'

/**
 * 封装的 ky 请求实例
 */
class RequestClient {
  private client: KyInstance

  constructor(baseOptions?: Options) {
    this.client = ky.create({
      timeout: 3 * 60 * 1000, // 3 分钟超时
      ...baseOptions,
    })
  }

  async send<T, K>(url: string, options: Options): Promise<T | K | string> {
    try {
      const response = await this.client(url, options)
      try {
        return (await response.clone().json()) as T
      } catch {
        return await response.clone().text()
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        try {
          return (await error.response.clone().json()) as K
        } catch {
          return await error.response.clone().text()
        }
      }

      throw error
    }
  }
}

// 导出单例
export const request = new RequestClient()
