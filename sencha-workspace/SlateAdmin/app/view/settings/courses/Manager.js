/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.Manager', {
    extend: 'Ext.grid.Panel',
    xtype: 'courses-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    store: 'courses.Courses',

    columns: [{
        text: 'Course',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Code',
        width: 160,
        dataIndex: 'Code'
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
    }],
    bbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Course',
        action: 'create-course'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});
