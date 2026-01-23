import concurrently from 'concurrently'
import process from 'node:process'

const args = process.argv.slice(2)

const script = args[0] ?? 'dev'
const packages = (args[1] ?? 'backend').split(',')

concurrently(
  packages.map((app) => ({
    name: app,
    command: `bun run --cwd apps/${app} ${script} ${args.slice(2).join(' ')}`,
  })),
)
