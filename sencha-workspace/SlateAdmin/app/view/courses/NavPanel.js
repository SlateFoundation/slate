/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'courses-navpanel',
    requires: [
        'Ext.form.Panel',
        'SlateAdmin.widget.SearchBar'
    ],
    
    title: 'Courses',
    html: [
        '<ul class="slate-nav-list">',
            '<li class="slate-nav-list-item"><a class="slate-nav-list-link" href="#courses/mycourses">My Courses</a></li>',
            '<li class="slate-nav-list-item"><a class="slate-nav-list-link" href="#courses">Browse All Courses</a></li>',
        '</ul>'
    ],
    dockedItems: [{
        xtype: 'form',
        dock: 'top',
        cls: 'navpanel-search-form',
        layout: 'auto',
        items: [{
            xtype: 'slateadmin-searchbar'
        }]
    }]
});