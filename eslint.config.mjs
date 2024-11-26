import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        plugins: {
            '@stylistic': stylistic,
        },
    },
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    stylistic.configs['recommended-flat'],
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                parser: tseslint.parser,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            'curly': ['error', 'multi-line'],
            'no-else-return': ['error']
        }
    },
    {
        rules: {
            '@stylistic/comma-dangle': ['error', 'only-multiline'],
            '@stylistic/indent': ['error', 4],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/brace-style': ['error', '1tbs']
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/unified-signatures': 'off',
        },
    },
    {
        ignores: [
            'dist',
            'public',
            'builds',
        ],
    },
];
