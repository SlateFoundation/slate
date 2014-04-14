/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.groups.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'groups-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Browse Members',
        action: 'browse-members',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Create Subgroup',
        action: 'create-subgroup',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Group',
        action: 'delete-group',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});