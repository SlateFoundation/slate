/*jslint browser: true, undef: true *//*global Ext*/
//TODO:  move to view.settings wih other settings managers
Ext.define('SlateAdmin.view.groups.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'groups-manager',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Jarvus.ext.actionevents.override.grid.column.ActionEvents'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'people.GroupsTree',
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
    },{
        xtype: 'actioncolumn',
        dataIndex: 'Class',
        width: 54,
        items: [
            {
                action: 'browsemembers',
                icon: 'http://www.goodsync.com/images/icons/C_Dis_Cir.png',
                tooltip: 'Browse Members'
            },
            {
                action: 'createsubgroup',
                icon: 'http://www.goodsync.com/images/icons/C_Dis_Cir.png',
                tooltip: 'Create Subgroup'
            },
            {
                action: 'deletegroup',
                icon: 'http://www.goodsync.com/images/icons/C_Dis_Cir.png',
                tooltip: 'Delete Group'
            }
        ]
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
