/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.AccountLevels', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.API'
    ],

    fields: [{
        name: 'value',
        convert: function(v, r) {
            return r.raw;
        }
    }],

    proxy: {
        type: 'slateapi',
        url: '/people/*account-levels',
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});