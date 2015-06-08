/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.departments.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'settings-courses-departments-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Delete Department',
        action: 'delete-department',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});