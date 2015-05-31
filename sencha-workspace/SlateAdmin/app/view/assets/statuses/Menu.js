/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.assets.statuses.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'assets-statuses-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Browse Statuses',
        action: 'browse-statuses',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Create Status',
        action: 'create-substatus',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Status',
        action: 'delete-status',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});