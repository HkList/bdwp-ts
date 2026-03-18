import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/drizzle/**',
      '**/.eslintcache',
      '**/backend/public/**',
    ],
    typescript: true,
    vue: true,
  },
  {
    files: [
      './apps/backend/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    rules: {
      'ts/explicit-function-return-type': 'off',
      'ts/no-use-before-define': 'off',
    },
  },
)
