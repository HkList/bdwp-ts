import concurrently from 'concurrently'
import process from 'node:process'

const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: bun run scripts/run-command.ts <script> <package1,package2,...> [args...]')
  process.exit(1)
}

const script = args[0]
const packages = args[1]!.split(',')

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
