/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'SlateAdmin.view.Header',
        'SlateAdmin.view.Navigation',
        'Ext.layout.container.Card'
    ],

    layout: 'border',
    items: [{
        xtype: 'slateadmin-header',
        region: 'north'
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
