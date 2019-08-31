/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.AccountLevels', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.API'
    ],

    idProperty: 'value',
    fields: [{
        name: 'value',
        type: 'string'
    }],

    proxy: {
        type: 'slateapi',
        url: '/people/*account-levels',
        reader: {
            type: 'json',
            transform: function(data) {
                return Ext.Array.map(data.data, function(value) {
                    return {
                        value: value
                    }
                });
            }
        }
    }
});