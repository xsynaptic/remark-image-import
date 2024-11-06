// @ts-check -- ESLint still lacks support for config files in native TypeScript
import eslint from '@eslint/js';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = tseslint.config(
  {
    ignores: ['**/node_modules', '**/dist', 'dist/**/*', '**/node_modules'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', 'tests/*.test.ts'],
        },
      },
      globals: {
        ...globals.builtin,
        ...globals.nodeBuiltin,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [String.raw`^@?\w`], // External packages
            [String.raw`^.*\u0000$`], // Type imports
            [String.raw`^\u0000`], // Side effect imports
            [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`], // Parent imports
            [
              String.raw`^\./(?=.*/)(?!/?$)`,
              String.raw`^\.(?!/?$)`,
              String.raw`^\./?$`,
            ], // Other relative imports
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },
  unicornPlugin.configs['flat/recommended'],
  {
    rules: {
      'unicorn/filename-case': [
        'warn',
        {
          case: 'kebabCase',
          ignore: [String.raw`^(README|TODO)\.md$`],
        },
      ],
      'unicorn/prevent-abbreviations': 'off',
    },
  }
);

export default config;
