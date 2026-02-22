import { Drizzle, Schemas } from '@backend/db'

async function main() {
  await Drizzle.insert(Schemas.User)
    .values([
      {
        username: 'admin',
        password: await Bun.password.hash('admin_password'),
        type: 'admin',
      },
    ])
    .onConflictDoUpdate({
      target: [Schemas.User.username],
      set: {
        username: 'admin',
        password: await Bun.password.hash('admin_password'),
        type: 'admin',
      },
    })

  console.log('Seeding completed.')
}

main()
