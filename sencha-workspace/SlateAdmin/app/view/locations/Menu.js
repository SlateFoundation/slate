/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.locations.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'locations-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Browse Locations',
        action: 'browse-locations',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Create Location',
        action: 'create-sublocation',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Location',
        action: 'delete-location',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});