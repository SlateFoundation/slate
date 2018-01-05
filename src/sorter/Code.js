Ext.define('Slate.sorter.Code', {
    extend: 'Ext.util.Sorter',


    config: {
        numberRe: /^\d+$/,
        numberDelim: '.',

        sorterFn: function(a, b) {
            var codeA = a.get('Code').toLowerCase(),
                codeB = b.get('Code').toLowerCase(),
                numberRe = this._numberRe, // eslint-disable-line no-underscore-dangle
                numberDelim = this._numberDelim, // eslint-disable-line no-underscore-dangle
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

});