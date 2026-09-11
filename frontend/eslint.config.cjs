const path = require('path');
const reactConfig = require('eslint-plugin-react').configs.recommended;
const typescriptConfig = require('@typescript-eslint/eslint-plugin').configs.recommended;
const reactHooksConfig = require('eslint-plugin-react-hooks').configs.recommended;
const prettierConfig = require('eslint-plugin-prettier').configs.recommended;

const rules = {
  ...typescriptConfig.rules,
  ...reactConfig.rules,
  ...reactHooksConfig.rules,
  ...prettierConfig.rules,
  // React 18 uses the automatic JSX runtime — no React import needed in scope
  'react/react-in-jsx-scope': 'off',
};

module.exports = [
  {
    ignores: ['vite.config.ts', 'vitest.config.ts', 'vitest.setup.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
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
    rules,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
