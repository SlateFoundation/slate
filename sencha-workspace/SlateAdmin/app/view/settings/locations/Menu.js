/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.locations.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'settings-locations-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Create Sub Location',
        action: 'create-sub-location',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Location',
        action: 'delete-location',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});