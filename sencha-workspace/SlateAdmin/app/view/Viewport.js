/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'SlateAdmin.view.Breadcrumbs',
        'SlateAdmin.view.Navigation',
        'Ext.layout.container.Card'
    ],

    layout: 'border',
    items: [{
/*
        region: 'north',
        layout: 'fit',
        items: [{
            xtype: 'slateadmin-breadcrumbs'
        }]
    },{
*/
        region: 'west',
        xtype: 'slateadmin-navigation',
        split: true,
        collapsible: false
    },{
        region: 'center',
        xtype: 'container',
        itemId: 'cardCt',
        layout: 'card',
        items: {
            xtype:'component',
            cls: 'slate-empty-view'
        }
    }]
});
