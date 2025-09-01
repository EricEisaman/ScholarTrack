module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['**/*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['vite.config.ts', 'vitest.config.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        'no-console': 'off',
        'no-debugger': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['src/services/logger.ts'],
      rules: {
        'no-restricted-syntax': 'off',
        'no-console': 'off',
      },
    },
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Microsoft-endorsed TypeScript rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/no-unused-components': 'error',
    'vue/no-unused-properties': 'error',
    'vue/valid-template-root': 'error',
    'vue/no-parsing-error': 'error',
    'vue/valid-v-slot': 'off', // Temporarily disabled due to false positives with destructured slots
    
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    // Allow logger methods but warn about direct console usage
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.object.name="console"][callee.property.name!="error"]',
        message: 'Use logger service instead of console.log/console.warn/console.info. Use logger.debug(), logger.info(), logger.warn(), or logger.error()'
      }
    ],
    'no-unused-vars': 'off', // Use TypeScript version instead
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'no-multiple-empty-lines': ['error', { max: 1 }],
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.min.js',
    'coverage/',
    '.vite/',
    'build-static.js',
    '.eslintrc.cjs',
    'public/sw.js',
    '**/*.js',
    '**/*.jsx',
    '**/*.cjs',
    '**/*.mjs',
  ],
};
