import type { TypeboxTypes } from '@backend/database/typebox.ts'
import { config } from '@backend/config.ts'
import { Relations } from '@backend/database/relations.ts'
import { Schemas } from '@backend/database/schema.ts'
import { Typeboxs } from '@backend/database/typebox.ts'
import { drizzle } from 'drizzle-orm/bun-sql'

export { Schemas, Typeboxs, TypeboxTypes }

export const Drizzle = drizzle(config.DATABASE_URL, {
  schema: Schemas,
  relations: Relations,
})
