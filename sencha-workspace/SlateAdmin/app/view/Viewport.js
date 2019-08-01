/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'SlateAdmin.view.Main'
    ],

    layout: 'fit',
    items: [{
        xtype: 'slateadmin-main'
    }]
});
