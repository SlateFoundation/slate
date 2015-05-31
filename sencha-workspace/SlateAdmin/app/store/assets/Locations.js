/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.assets.Locations', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.asset.Location',
    autoLoad: true,
    nodeParam: 'parentLocation'
});