module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  env: {
    jest: true,
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'prefer-const': 'error',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/func-call-spacing': 'off',
    'react/no-unstable-nested-components': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
