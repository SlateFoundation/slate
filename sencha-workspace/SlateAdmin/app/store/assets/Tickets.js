/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.assets.Tickets', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.asset.Ticket',
    
    buffered: true,
    pageSize: 100,
    leadingBufferZone: 200

});