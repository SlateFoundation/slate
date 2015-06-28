/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.departments.Manager', {
    extend: 'Ext.grid.Panel',
    xtype: 'departments-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    store: 'courses.Departments',

    columns: [{
        text: 'Department',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Code',
        width: 160,
        dataIndex: 'Code',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: {
            xtype: 'combo',
//          valueField: 'name',
            displayField: 'name',
            store: {
                fields: ['name'],
                data: [
                    {name: 'Hidden'},
                    {name: 'Live'},
                    {name: 'Deleted'}
                ]
            }
        }
    },{
        xtype: 'actioncolumn',
        dataIndex: 'Class',
        width: 54,
        items: [
            {
                action: 'browsecourses',
                icon: 'http://icons.iconarchive.com/icons/everaldo/crystal-clear/16/Action-run-icon.png',
                iconCls: 'group-browse glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Browse Courses'
            },
            {
                action: 'deletedepartment',
                icon: 'http://icons.iconarchive.com/icons/everaldo/crystal-clear/16/Action-run-icon.png',
                iconCls: 'group-delete glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Department'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Department',
        action: 'create-department'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});
