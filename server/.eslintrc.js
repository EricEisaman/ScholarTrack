module.exports = {
  extends: ['../.eslintrc.js'],
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Server-specific overrides
    'no-console': 'off', // Allow console in server code
    '@typescript-eslint/no-explicit-any': 'error', // Strict for server
    '@typescript-eslint/explicit-function-return-type': 'error', // Require return types
    '@typescript-eslint/explicit-module-boundary-types': 'error', // Require module boundary types
  },
  overrides: [
    {
      files: ['index.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Allow require for database
      },
    },
  ],
};
