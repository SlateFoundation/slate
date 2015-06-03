/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.assets.statuses.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'assets-statuses-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'assets.StatusesTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Name',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Assets',
        width: 100,
        dataIndex: 'assetsCount'
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
        text: 'Create Status',
        action: 'create-status'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});