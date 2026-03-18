import { Drizzle, Schemas } from '@backend/db'

export async function main() {
  if (await Drizzle.query.User.findFirst({ where: { id: 1 } })) {
    return
  }

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
