/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'settings-courses-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Delete Course',
        action: 'delete-course',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});