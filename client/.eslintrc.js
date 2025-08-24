module.exports = {
  extends: ['../.eslintrc.js'],
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Client-specific overrides
    'no-console': 'warn', // Allow console in development
    '@typescript-eslint/no-explicit-any': 'warn', // Slightly more lenient for client
  },
  overrides: [
    {
      files: ['src/stores/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn', // Allow some flexibility in stores
      },
    },
    {
      files: ['src/components/**/*.vue'],
      rules: {
        'vue/no-unused-vars': 'error',
        'vue/no-unused-components': 'error',
      },
    },
  ],
};
