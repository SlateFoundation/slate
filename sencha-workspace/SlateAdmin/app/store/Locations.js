/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Locations', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.Location',
    proxy: {
        type: 'slaterecords',
        url: '/locations',
        startParam: false,
        limitParam: false
    }
});