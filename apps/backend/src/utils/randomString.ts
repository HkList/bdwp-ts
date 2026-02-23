import { randomBytes } from 'node:crypto'

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function randomString(length: number): string {
  const bytes = randomBytes(length)
  return Array.from(bytes, byte => chars[byte % chars.length]).join('')
}
