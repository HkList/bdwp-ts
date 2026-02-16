import antfu from '@antfu/eslint-config'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { globalIgnores } from 'eslint/config'

export default antfu(
  globalIgnores(['**/dist/**', '**/coverage/**', '**/node_modules/**', 'tsconfig.json']),

  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'off',
      'antfu/no-top-level-await': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'antfu/consistent-list-newline': 'off',
    },
  },

  eslintConfigPrettier,
)
