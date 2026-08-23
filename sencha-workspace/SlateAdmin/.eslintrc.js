// SlateAdmin carries three eras of code (2015-2022). Correctness rules are
// enforced at error level by the root config and CI; the legacy-style rules
// below are downgraded to warnings HERE ONLY so the lint gate stays green
// while files converge on the house style as they're touched for real work
// (see the jarvus-extjs skill: don't churn working code for style alone).
//
// Ratchet: when a rule's warning count hits zero, delete it from this list
// so it enforces at error level again.
module.exports = {
    rules: {
        'brace-style': 'warn',
        'camelcase': 'warn',
        'comma-spacing': 'warn',
        'comma-style': 'warn',
        'consistent-return': 'warn',
        'func-style': 'warn',
        'indent': 'warn',
        'key-spacing': 'warn',
        'keyword-spacing': 'warn',
        'lines-around-comment': 'warn',
        'max-depth': 'warn',
        'newline-after-var': 'warn',
        'newline-per-chained-call': 'warn',
        'no-extra-parens': 'warn',
        'no-multi-spaces': 'warn',
        'no-multiple-empty-lines': 'warn',
        'no-negated-condition': 'warn',
        'no-prototype-builtins': 'warn',
        'no-trailing-spaces': 'warn',
        'no-underscore-dangle': 'warn',
        'object-curly-spacing': 'warn',
        'object-property-newline': 'warn',
        'one-var': 'warn',
        'operator-linebreak': 'warn',
        'prefer-spread': 'warn',
        'quotes': 'warn',
        'require-jsdoc': 'warn',
        'space-before-blocks': 'warn',
        'vars-on-top': 'warn',
        'wrap-iife': 'warn',
        'yoda': 'warn'
    }
};
