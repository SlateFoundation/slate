/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.groups.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'groups-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'Groups',
    columns: [{
        xtype: 'treecolumn',
        text: 'Group',
        flex: 2,
        dataIndex: 'Name',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Population',
        width: 100,
        dataIndex: 'Population'
    },{
        text: 'Group Type',
        width: 150,
        dataIndex: 'Class'
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
                    {name: 'Active'},
                    {name: 'Disabled'}
                ]
            }
        }
    }],
    bbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Organization',
        action: 'create-organization'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});