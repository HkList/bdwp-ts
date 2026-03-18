import type { TypeboxTypes } from '@backend/database/typebox.ts'
import { config } from '@backend/config.ts'
import { Relations } from '@backend/database/relations.ts'
import { Schemas } from '@backend/database/schema.ts'
import { main } from '@backend/database/seeder.ts'
import { Typeboxs } from '@backend/database/typebox.ts'
import { drizzle } from 'drizzle-orm/bun-sql'
import { migrate } from 'drizzle-orm/bun-sql/postgres/migrator'

const Drizzle = drizzle(config.DATABASE_URL, {
  schema: Schemas,
  relations: Relations,
})

export async function initDrizzle() {
  await migrate(Drizzle, { migrationsFolder: './drizzle' })
  await main()
  console.log('🔄 Drizzle迁移已同步!')
}

export { Drizzle, Schemas, Typeboxs }
export type { TypeboxTypes }
