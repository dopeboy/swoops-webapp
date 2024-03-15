module.exports = {
    root: true,
    env: {
        es2021: true,
    },
    extends: [
        'standard',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended', // TypeScript rules
        'plugin:@typescript-eslint/recommended', // TypeScript rules
        'plugin:prettier/recommended', // Prettier plugi
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: ['@typescript-eslint', 'prettier'],
    ignorePatterns: ['node_modules/**/*', '!.prettierrc.js', '!.eslintrc.js', '*.json', '*.lock'],
    rules: {
        // @raja TODO - check if this can be enabled
        camelcase: 0,

        // accept unused vars with an underscore prefix
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

        // require return types on functions only where useful
        '@typescript-eslint/explicit-function-return-type': [
            'warn',
            {
                allowExpressions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true,
            },
        ],

        'prettier/prettier': ['error', {}, { usePrettierrc: true }],

        // allow empty constructor in typescript
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': ['error'],

        'no-return-await': ['error'],
    },
};
