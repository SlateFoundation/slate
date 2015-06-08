/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.assets.statuses.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'settings-assets-statuses-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Create Sub Status',
        action: 'create-sub-status',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Status',
        action: 'delete-status',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});