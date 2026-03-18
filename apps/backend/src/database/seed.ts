import { main } from '@backend/database/seeder.ts'

(async () => {
  await main()
  console.log('Seeding completed.')
})()
