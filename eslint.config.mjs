import pluginJs from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {plugins: {'@stylistic': stylistic}},
    {files: ['**/*.{js,mjs,cjs,ts}']},
    {languageOptions: {globals: globals.browser}},
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
            'no-else-return': ['error'],
        },
    },
    {
        rules: {
            '@stylistic/brace-style': ['error', '1tbs'],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/indent': ['error', 4],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/block-spacing': ['error', 'always'],
            '@stylistic/comma-spacing': 'error',
            '@stylistic/comma-style': ['error', 'last'],
            '@stylistic/computed-property-spacing': ['error', 'never'],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/function-call-spacing': ['error', 'never'],
            '@stylistic/function-paren-newline': ['error', 'never'],
            '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/lines-between-class-members': ['error', 'always'],
            '@stylistic/multiline-ternary': ['error', 'always-multiline'],
            '@stylistic/new-parens': 'error',
            '@stylistic/newline-per-chained-call': ['error', {ignoreChainWithDepth: 3}],
            '@stylistic/no-extra-parens': 'error',
            '@stylistic/no-extra-semi': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', {max: 2, maxEOF: 1, maxBOF: 0}],
            '@stylistic/no-tabs': ['error'],
            '@stylistic/no-whitespace-before-property': ['error'],
            '@stylistic/object-curly-newline': ['error', {
                ObjectExpression: {multiline: true},
                ObjectPattern: 'never',
                ImportDeclaration: 'never',
                ExportDeclaration: {multiline: true, minProperties: 3},
            }],
            '@stylistic/object-curly-spacing': ['error', 'never'],
            '@stylistic/object-property-newline': ['error', {allowAllPropertiesOnSameLine: true}],
            '@stylistic/operator-linebreak': ['error', 'after'],
            '@stylistic/padding-line-between-statements': ['error'],
            '@stylistic/member-delimiter-style': ['error'],
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
            'node_modules',
            'dist',
            'public',
            'builds',
            'out',
        ],
    },
];
