module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // React 17+ JSX transform — no need to import React for JSX
    'react/react-in-jsx-scope': 'off',
    // Warn instead of error for any; explicit-any is common in generic components
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow omitting return types on obvious functions
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Prop types are replaced by TypeScript
    'react/prop-types': 'off',
  },
  env: {
    es2019: true,
  },
  ignorePatterns: ['lib/', 'dist/', 'node_modules/'],
};
