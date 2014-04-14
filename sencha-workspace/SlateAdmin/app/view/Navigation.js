/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.Navigation', {
    extend: 'Ext.Container' ,
    xtype: 'slateadmin-navigation',
    requires: [
        'Ext.layout.container.Accordion'
    ],

    width: 210,
    defaults: {
        bodyPadding: 10
    },
    layout: {
        type: 'accordion'
    }
});