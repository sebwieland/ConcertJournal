const path = require('path');
const reactConfig = require('eslint-plugin-react').configs.recommended;
const typescriptConfig = require('@typescript-eslint/eslint-plugin').configs.recommended;
const reactHooksConfig = require('eslint-plugin-react-hooks').configs.recommended;
const prettierConfig = require('eslint-plugin-prettier').configs.recommended;

module.exports = [
  {
    files: ['**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __DEV__: 'readonly',
      },
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: path.resolve(__dirname),
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      react: require('eslint-plugin-react'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      ...reactConfig.rules,
      ...typescriptConfig.rules,
      ...reactHooksConfig.rules,
      ...prettierConfig.rules,
      // Custom rules can be added here
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];