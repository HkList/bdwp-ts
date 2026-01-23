import concurrently from 'concurrently'
import process from 'node:process'

const args = process.argv.slice(2)

const script = args[0] ?? 'dev'
const packages = (args[1] ?? 'backend').split(',')

const { result } = concurrently(
  packages.map((app) => ({
    name: app,
    command: `bun run --cwd apps/${app} ${script} ${args.slice(2).join(' ')}`,
  })),
  {
    killOthersOn: ['failure'],
  },
)

result.then(
  () => process.exit(0),
  () => process.exit(1),
)
