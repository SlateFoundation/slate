/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'courses-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search'
    ],
    
    title: 'Courses',
    html: [
        '<ul class="slate-nav-list">',
            '<li class="slate-nav-list-item"><a class="slate-nav-list-link" href="#courses/mycourses">My Courses</a></li>',
            '<li class="slate-nav-list-item"><a class="slate-nav-list-link" href="#courses">Browse All Courses</a></li>',
        '</ul>'
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