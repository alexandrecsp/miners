import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const PURE_CORE_MSG = 'The Game core must stay pure.'
const NO_BROWSER_MSG = 'No browser globals in the Game core.'
const PASS_TIME_MSG = 'Pass the time in as a parameter.'
const BROWSER_GLOBALS = ['window', 'document', 'localStorage']
const FORBIDDEN_PACKAGES = ['react', 'react-dom', 'three', 'zustand', 'leva', 'idb-keyval']

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ['src/core/**/*.{ts,tsx,mts,cts,js,jsx}'],
    languageOptions: { globals: Object.fromEntries(Object.keys(globals.node).map((k) => [k, 'off'])) },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: FORBIDDEN_PACKAGES.map((name) => ({ name, message: PURE_CORE_MSG })),
          patterns: [{ group: [...FORBIDDEN_PACKAGES.map((n) => `${n}/*`), '@react-three/*'], message: PURE_CORE_MSG }],
        },
      ],
      'no-restricted-globals': ['error', ...BROWSER_GLOBALS.map((name) => ({ name, message: NO_BROWSER_MSG }))],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Draw through the Rng.' },
        { object: 'Date', property: 'now', message: PASS_TIME_MSG },
        { object: 'performance', property: 'now', message: PASS_TIME_MSG },
        ...BROWSER_GLOBALS.map((property) => ({ object: 'globalThis', property, message: NO_BROWSER_MSG })),
      ],
    },
  },
)
