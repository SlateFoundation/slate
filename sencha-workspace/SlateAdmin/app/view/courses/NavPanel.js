/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'courses-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search'
    ],
    
    title: 'Courses',
    data: [
        { href: '#courses/mine', text: 'My Courses' },
        { href: '#courses/all', text: 'All Courses' }
    ],
    dockedItems: [{
        dock: 'top',

        xtype: 'form',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'searchfield',
            anchor: '100%'
        }]
    }]
});