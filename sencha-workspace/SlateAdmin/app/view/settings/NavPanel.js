/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'settings-navpanel',

    title: 'Settings',
    data: [
        { href: '#settings/groups', text: 'Groups' },
        { href: '#settings/terms', text: 'Terms' },
        { href: '#settings/departments', text: 'Departments' },
        { href: '#settings/courses', text: 'Courses' },
        { href: '#settings/global-recipients', text: 'Global Recipients' },
        { href: '#settings/locations', text: 'Locations' }
//        { href: '#settings/asset-statuses', text: 'Asset Statuses' }
    ]
});
