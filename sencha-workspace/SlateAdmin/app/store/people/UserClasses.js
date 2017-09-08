/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.UserClasses', {
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
        url: '/people/*classes',
        extraParams: {
            interface: 'user'
        },
        reader: {
            type: 'json',
            transform: function(response) {
                return Ext.Array.map(response.data, function (cls) {
                    return {
                        value: cls
                    }
                });
            }
        }
    }
});