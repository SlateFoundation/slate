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
        xtype: 'slateadmin-navigation',
        region: 'west',
        split: true,
        collapsible: false
    },{
        xtype: 'container',
        itemId: 'cardCt',
        region: 'center',
        layout: 'card',
        items: {
            xtype:'component',
            cls: 'slate-empty-view'
        }
    }]
});
