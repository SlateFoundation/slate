/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,BlogEditor*/
Ext.define('BlogEditor.view.Viewport', {
    renderTo: Ext.getBody()
    ,extend: 'Ext.container.Viewport'
    ,alias: 'widget.blogeditor-viewport'
    ,requires:[
        'Ext.tab.Panel',
        'Ext.layout.container.Border'
    ],

    layout: {
        type: 'border'
    },

    items: [{
        region: 'west',
        xtype: 'panel',
        title: 'west',
        width: 150
    },{
        region: 'center',
        xtype: 'tabpanel',
        items:[{
            title: 'Editor'
            ,xtype: 'blogeditor-manager'
        }]
    }]
});