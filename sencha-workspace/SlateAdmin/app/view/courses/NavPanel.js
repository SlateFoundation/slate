/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.NavPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'courses-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search'
    ],

    title: 'Courses',
    autoScroll: true,
    bodyPadding: '10 10 0',

    dockedItems: [{
        dock: 'top',

        xtype: 'container',
        cls: 'navpanel-search-form',
        layout: 'fit',
        items: [{
            xtype: 'jarvus-searchfield',
            name: 'query'
        }]
    },{
        dock: 'bottom',
        
        xtype: 'button',
        action: 'create-section',
        text: 'Create Section',
        href: '#course-sections/create',
        hrefTarget: '_self'
    }],

    defaults: {
        anchor: '100%',
        xtype: 'textfield',
        labelWidth: 45,
        labelSeparator: '',
        labelAlign: 'right',
        labelStyle: 'font-size: small; color: #666',
        labelPad: 10,
        autoSelect: false // only for combo boxes
    },
    items: [{
        xtype: 'combo',
        name: 'teacher',
        fieldLabel: 'Teacher',

        queryMode: 'local',
        store: 'courses.Teachers',
        valueField: 'Username',
        displayField: 'FullName',

        emptyText: 'Any'
    },{
        xtype: 'combo',
        name: 'course',
        fieldLabel: 'Course',

        queryMode: 'local',
        store: 'courses.Courses',
        valueField: 'Code',
        displayField: 'Code',

        emptyText: 'Any'
    },{
        xtype: 'combo',
        name: 'department',
        fieldLabel: 'Dept.',

        queryMode: 'local',
        store: 'courses.Departments',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'term',
        fieldLabel: 'Term',

        queryMode: 'local',
        store: 'Terms',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'schedule',
        fieldLabel: 'Schedule',

        queryMode: 'local',
        store: 'courses.Schedules',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'location',
        fieldLabel: 'Location',

        queryMode: 'local',
        store: 'Locations',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'button',
        anchor: false,
        margin: '0 0 0 55',
        action: 'search',
        text: 'Search',
        glyph: 0xf002 // fa-search
    },{
        xtype: 'button',
        anchor: false,
        margin: '0 0 0 55',
        action: 'reset',
        text: 'Reset'
    }]
});