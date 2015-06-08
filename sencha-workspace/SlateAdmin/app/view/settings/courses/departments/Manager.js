/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.departments.Manager', {
    extend: 'Ext.grid.Panel',
    xtype: 'settings-courses-departments-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'settings.courses.Departments',
    columns: [{
        text: 'Title',
        width: 200,
        dataIndex: 'Title',
        editor: 'textfield'
    }, {
        text: 'Code',
        width: 100,
        dataIndex: 'Code',
        editor: 'textfield'
    }, {
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: {
            xtype: 'combo',
            displayField: 'name',
            store: {
                fields: ['name'],
                data: [
                    {name: 'Live'},
                    {name: 'Hidden'},
                    {name: 'Deleted'}
                ]
            }
        }
    }, {
        text: 'Description',
        flex: 1,
        dataIndex: 'Description',
        editor: 'textareafield'
    }],
    tbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Department',
        action: 'create-department'
    }],
    plugins: [{
        ptype: 'cellediting',
        clicksToEdit: 2,
        pluginId: 'courseDepartmentEditing'
    }]
});