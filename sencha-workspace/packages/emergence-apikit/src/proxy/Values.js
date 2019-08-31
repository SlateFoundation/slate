Ext.define('Emergence.proxy.Values', {
    extend: 'Jarvus.proxy.API',
    alias: 'proxy.emergence-values',
    requires: [
        'Emergence.util.API',
        'Ext.data.reader.Json'
    ],

    config: {
        connection: 'Emergence.util.API',

        /**
         * @cfg The base URL for the managed collection (e.g. '/people')
         * @required
         */
        url: null,

        reader: {
            type: 'json',
            transform: function(response) {
                return Ext.Array.map(response.data, function(value) {
                    return {
                        value: value
                    };
                });
            }
        }
    }
});
