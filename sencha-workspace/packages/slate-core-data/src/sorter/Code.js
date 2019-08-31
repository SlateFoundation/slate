Ext.define('Slate.sorter.Code', {
    extend: 'Ext.util.Sorter',


    config: {
        numberRe: /^\d+$/,
        numberDelim: '.',

        codeFn: function(item) {
            return item.get('Code');
        },

        sorterFn: function(a, b) {
            var me = this,
                codeFn = me._codeFn || me.codeFn, // eslint-disable-line no-underscore-dangle
                numberRe = me._numberRe || me.numberFn, // eslint-disable-line no-underscore-dangle
                numberDelim = me._numberDelim || me.numberDelim, // eslint-disable-line no-underscore-dangle
                codeA = codeFn(a).toLowerCase(),
                codeB = codeFn(b).toLowerCase(),
                dotIndexA, dotIndexB,
                numberA, numberB;

            if (codeA == codeB) {
                return 0;
            }

            dotIndexA = codeA.lastIndexOf(numberDelim);
            dotIndexB = codeB.lastIndexOf(numberDelim);

            if (
                dotIndexA == -1
                || dotIndexB == -1
                || codeA.substr(0, dotIndexA) != codeB.substr(0, dotIndexB)
                || (numberA = codeA.substr(dotIndexA + 1)) == ''
                || (numberB = codeB.substr(dotIndexB + 1)) == ''
                || !numberRe.test(numberA)
                || !numberRe.test(numberB)
            ) {
                return codeA < codeB ? -1 : 1;
            }

            return numberA - numberB;
        }
    },


    constructor: function(config) {
        this.initConfig(config);
    }
});