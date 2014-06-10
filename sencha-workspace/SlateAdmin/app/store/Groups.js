/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Groups', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.Group'
    ],

    model: 'SlateAdmin.model.Group',
    proxy: {
        type: 'slaterecords',
        url: '/groups',
        startParam: false,
        limitParam: false,
        include: 'Population',
        extraParams: {
            parentGroup: 'any'
        }
    }
});