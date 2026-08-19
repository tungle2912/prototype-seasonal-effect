import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // --- Prototype base house rules (see docs/prototype-rules.md) ---

      // Colors, spacing and typography must come from Polaris design tokens so
      // prototypes stay visually consistent with the Shopify admin.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#(?:[0-9a-fA-F]{3}){1,2}\\b/]',
          message:
            'Hardcoded hex colors are not allowed. Use Polaris design tokens, e.g. var(--p-color-text-secondary).',
        },
      ],

      // Prototypes are static and offline: all data comes from src/mocks.
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Prototypes must not make network calls. Add a fixture in src/mocks and use useMockData().',
        },
        {
          name: 'XMLHttpRequest',
          message:
            'Prototypes must not make network calls. Add a fixture in src/mocks and use useMockData().',
        },
      ],

      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // The scaffolding template is intentionally a copy-me stub.
  {
    files: ['src/prototypes/_template/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // --- Narrow exception to the no-hex rule ---
  //
  // The rule exists so admin *chrome* stays on Polaris tokens. Two kinds of
  // colour are not chrome:
  //
  //   1. Colour the merchant picks. A seasonal palette, a brand colour, a
  //      button colour: the value is content, and a Polaris token cannot
  //      express "the merchant chose #C0392B".
  //   2. Colour inside a simulated storefront. A storefront preview is meant to
  //      look like the merchant's theme, not like the admin, so borrowing admin
  //      tokens there would make the preview lie.
  //
  // Everything else — every border, background and label of the admin UI — is
  // still a lint error. See docs/prototype-rules.md.
  {
    files: [
      'src/mocks/seasonal-effects/palettes.ts',
      'src/prototypes/seasonal-effects/components/preview/**',
    ],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
