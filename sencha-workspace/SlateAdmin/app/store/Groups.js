/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Groups', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'SlateAdmin.model.Group'
    ],
    
    model: 'SlateAdmin.model.Group', 
    root: {
        text: 'Groups',
        ID: null,
        leaf: true
    },
    nodeParam: 'parentGroup'
});
