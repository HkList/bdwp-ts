import { Drizzle, Schemas } from '@backend/db'

export async function main() {
  await Drizzle.insert(Schemas.User)
    .values([
      {
        username: 'admin',
        password: await Bun.password.hash('admin_password'),
        type: 'admin',
      },
    ])
    .onConflictDoNothing()
}
