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
    bodyPadding: 0,

    dockedItems: [{
        dock: 'top',

        xtype: 'form',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'searchfield',
            anchor: '100%'
        }]
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
        xtype: 'combobox',
        name: 'term',
        fieldLabel: 'Term',
        emptyText: 'Current Term',
        queryMode: 'local',
        store: 'Terms',
        valueField: 'ID',
        displayField: 'Title'
    },{
        xtype: 'combo',
        name: 'teacher',
        fieldLabel: 'Teacher',
        displayField: 'FullName',
        valueField: 'Username',
        emptyText: 'Any',
        queryMode: 'local',
        store: {
            fields: [
                {name: 'Username'},
                {
                    name: 'FullName',
                    convert: function(v, r) {
                        return r.raw.LastName + ', ' + r.raw.FirstName;
                    }
                }
            ],
            proxy: {
                type: 'slateapi',
                url: '/people/*advisors', // TODO: change to /sections/*teachers
                summary: true,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        }        
    },{
        xtype: 'combo',
        name: 'room',
        fieldLabel: 'Room',
        displayField: 'Title',
        valueField: 'Handle',
        emptyText: 'Any',
        queryMode: 'local',
        store: {
            fields: [
                {name: 'Username'},
                {
                    name: 'FullName',
                    convert: function(v, r) {
                        return r.raw.LastName + ', ' + r.raw.FirstName;
                    }
                }
            ],
            proxy: {
                type: 'slateapi',
                url: '/people/*advisors', // TODO: change to /sections/*rooms
                summary: true,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        }        
    },{
        xtype: 'combo',
        name: 'course',
        fieldLabel: 'Course',
        displayField: 'Title',
        valueField: 'Handle',
        emptyText: 'Any',
        queryMode: 'local',
        store: {
            fields: [
                {name: 'Username'},
                {
                    name: 'FullName',
                    convert: function(v, r) {
                        return r.raw.LastName + ', ' + r.raw.FirstName;
                    }
                }
            ],
            proxy: {
                type: 'slateapi',
                url: '/courses',
                summary: true,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        }        
    },{
        xtype: 'combo',
        name: 'schedule',
        fieldLabel: 'Schedule',
        displayField: 'Title',
        valueField: 'Handle',
        emptyText: 'Any',
        queryMode: 'local',
        store: {
            fields: [
                {name: 'Username'},
                {
                    name: 'FullName',
                    convert: function(v, r) {
                        return r.raw.LastName + ', ' + r.raw.FirstName;
                    }
                }
            ],
            proxy: {
                type: 'slateapi',
                url: '/courses/*schedules', // TODO: change to /sections/*rooms
                summary: true,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            }
        }        
    },{
        xtype: 'button',
        anchor: false,
        margin: '0 0 0 55',
        action: 'search',
        text: 'Search',
        glyph: 0xf002 // fa-search
    }]
});