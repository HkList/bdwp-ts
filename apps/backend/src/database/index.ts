import type { TypeboxTypes } from '@backend/database/typebox.ts'
import { config } from '@backend/config.ts'
import { Relations } from '@backend/database/relations.ts'
import { Schemas } from '@backend/database/schema.ts'
import { Typeboxs } from '@backend/database/typebox.ts'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/postgres/migrator'

const Drizzle = drizzle(config.DATABASE_URL, {
  schema: Schemas,
  relations: Relations,
})

export async function initDrizzle() {
  await migrate(Drizzle, { migrationsFolder: config.NODE_ENV === 'development' ? './drizzle' : './drizzle' })
  console.log('🔄 Drizzle迁移已同步!')
}

export { Drizzle, Schemas, Typeboxs }
export type { TypeboxTypes }
