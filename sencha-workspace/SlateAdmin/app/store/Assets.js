/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Assets', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.Asset',
    
    buffered: true,
    pageSize: 50,
    leadingBufferZone: 200
    
});