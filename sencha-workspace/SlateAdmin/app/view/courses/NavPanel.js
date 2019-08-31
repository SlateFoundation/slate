/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.courses.NavPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'courses-navpanel',
    requires: [
        'Ext.form.Panel',
        'Ext.data.ChainedStore',
        'Jarvus.ext.form.field.Search'
    ],

    title: 'Courses',
    autoScroll: true,
    bodyPadding: '10 10 0',
    cls: 'navpanel-search-criteria',

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

        xtype: 'container',
        layout: 'fit',
        padding: 10,
        items: [{
            xtype: 'button',
            action: 'create-section',
            text: 'Create Section',
            glyph: 0xf055, // fa-plus-circle
            href: '#course-sections/create',
            hrefTarget: '_self'
        }]
    }],

    defaults: {
        anchor: '100%',
        xtype: 'textfield',
        labelWidth: 45,
        labelSeparator: '',
        labelAlign: 'right',
        labelPad: 10,

        // only for combo boxes:
        autoSelect: false,
        matchFieldWidth: false
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

        store: {
            type: 'chained',
            source: 'courses.Departments'
        },
        queryMode: 'local',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'term',
        fieldLabel: 'Term',

        store: {
            type: 'chained',
            source: 'Terms'
        },
        queryMode: 'local',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'schedule',
        fieldLabel: 'Schedule',

        store: {
            type: 'chained',
            source: 'courses.Schedules'
        },
        queryMode: 'local',
        valueField: 'Handle',
        displayField: 'Title',

        emptyText: 'Any'
    },{
        xtype: 'combobox',
        name: 'location',
        fieldLabel: 'Location',

        store: {
            type: 'chained',
            source: 'Locations'
        },
        queryMode: 'local',
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
/*
    },{
        xtype: 'button',
        anchor: false,
        margin: '0 0 0 55',
        action: 'reset',
        text: 'Reset'
*/
    }]
});