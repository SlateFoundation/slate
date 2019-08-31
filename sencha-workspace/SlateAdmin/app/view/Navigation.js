/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Navigation', {
    extend: 'Ext.Container' ,
    xtype: 'slateadmin-navigation',
    requires: [
        'Ext.layout.container.Accordion'
    ],

    cls: 'slateadmin-navigation',

    width: 200,
    layout: {
        type: 'accordion'
    },
    items: [{
        // dummy first item so the rest can start collapsed
        xtype: 'panel',
        hidden: true,
        collapsed: false
    }]
});