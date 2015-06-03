/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.assets.Statuses', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.asset.Status',
    autoLoad: true,
    
    nodeParam: 'parentStatus'
});