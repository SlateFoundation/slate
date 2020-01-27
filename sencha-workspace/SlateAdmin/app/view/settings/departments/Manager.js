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
        width: 200,
        dataIndex: 'Handle',
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
        width: 50, // n*15+20
        align: 'end',
        items: [
            {
                action: 'browsecourses',
                glyph: 0xf06e, // fa-eye // 0xf0ca, // fa-list-ul
                tooltip: 'Browse Courses'
            },
            {
                action: 'deletedepartment',
                iconCls: 'glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Department'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        glyph: 0xf055, // fa-plus-circle,
        cls: 'glyph-success',
        text: 'Create Department',
        action: 'create-department'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});
