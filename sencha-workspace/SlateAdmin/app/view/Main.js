/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Main', {
    extend: 'Ext.container.Container',
    xtype: 'slateadmin-main',
    requires: [
        'SlateAdmin.view.Navigation',
        'Ext.layout.container.Card'
    ],

    autoEl: 'main',
    componentCls: 'slateadmin-main',
    layout: 'border',
    items: [{
        region: 'west',
        xtype: 'slateadmin-navigation',
        split: true,
        collapsible: false
    },{
        region: 'center',
        xtype: 'container',
        itemId: 'cardCt',
        layout: 'card',
        cls: 'slate-empty-view'
    }]
});
