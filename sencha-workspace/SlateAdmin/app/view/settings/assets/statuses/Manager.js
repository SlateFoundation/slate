/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.assets.statuses.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'settings-assets-statuses-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    allowDeselect: true,
    store: 'settings.assets.StatusesTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Term',
        flex: 1,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: {
            xtype: 'combo',
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
    tbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Status',
        action: 'create-status'
    }],
    viewConfig: {
        plugins: {
            ptype: 'treeviewdragdrop',
            dragText : '{0} selected item{1}'
        }
    },
    plugins: [{
        ptype: 'cellediting'
    }]
});