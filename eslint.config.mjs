import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

const projectRules = {
  camelcase: ['error', { properties: 'never' }],
  curly: ['error', 'multi-line'],
  'guard-for-in': 'error',
  'new-cap': 'error',
  'no-array-constructor': 'error',
  'no-caller': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-invalid-this': 'error',
  'no-multi-spaces': 'error',
  'no-multi-str': 'error',
  'no-new-object': 'error',
  'no-new-wrappers': 'error',
  'no-throw-literal': 'error',
  'no-unused-vars': ['error', { args: 'none' }],
  'no-var': 'error',
  'no-with': 'error',
  'one-var': [
    'error',
    {
      var: 'never',
      let: 'never',
      const: 'never',
    },
  ],
  'prefer-const': ['error', { destructuring: 'all' }],
  'prefer-promise-reject-errors': 'error',
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  'quote-props': ['error', 'consistent'],
};

export default [
  // Global ignores
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.vscode/extensions.js',
      'safari/**',
    ],
  },

  // Base configuration for JS/MJS files
  js.configs.recommended,

  // Main custom configuration
  {
    files: ['**/*.{js,mjs}'],
    plugins: {
      prettier,
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    rules: {
      ...projectRules,
      'prettier/prettier': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // Override for Node.js configuration files
  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['Gruntfile.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
  },

  // Prettier config must be last
  // This turns off all rules that are unnecessary or might conflict with Prettier.
  prettierConfig,
];
