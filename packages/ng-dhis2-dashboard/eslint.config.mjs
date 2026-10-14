import baseConfig from '../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';
import jsoncEslintParser from 'jsonc-eslint-parser';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ngDhis2Ui',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'd2',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-standalone': 'off',
      // Constructor injection remains part of this library's stable test and
      // consumer surface; migrate it separately rather than as release cleanup.
      '@angular-eslint/prefer-inject': 'off',
    },
  },
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        { ignoredDependencies: ['tslib'] },
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    files: ['**/.storybook/middleware.js'],
    rules: { '@nx/enforce-module-boundaries': 'off' },
  },
  {
    files: ['**/src/testing/**/*.ts'],
    rules: { '@angular-eslint/component-selector': 'off' },
  },
  {
    ignores: ['storybook-static'],
  },
];
