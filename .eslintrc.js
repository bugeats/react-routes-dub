module.exports = {
    'extends': 'eslint:recommended',
    'rules': {
        'brace-style': [2, '1tbs'],
        'camelcase': 1,
        'comma-dangle': [2, 'never'],
        'comma-spacing': [2, { 'before': false, 'after': true }],
        'comma-style': [2, 'last'],
        'consistent-return': 2,
        'eqeqeq': 2,
        'indent': [2, 2],
        'linebreak-style': [2, 'unix'],
        'no-else-return': 2,
        'no-redeclare': 0,
        'no-undef': 0,
        'no-underscore-dangle': 0,
        'object-curly-spacing': [2, 'always'],
        'prefer-const': 1,
        'quotes': [2, 'single'],
        'semi': [2, 'always'],
        'semi-spacing': [2, { 'before': false, 'after': true }],
        'space-before-blocks': [2, 'always'],
        'space-before-function-paren': ['error', 'always'],
        'space-in-parens': [2, 'never'],
        'strict': 0
    },
    'env': {
        'node': true,
        'es6': true
    }
};
