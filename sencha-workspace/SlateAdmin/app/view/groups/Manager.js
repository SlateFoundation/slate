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
                iconCls: 'group-browse glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Browse Members'
            },
            {
                action: 'createsubgroup',
                iconCls: 'group-create-subgroup glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Create Subgroup'
            },
            {
                action: 'deletegroup',
                iconCls: 'group-delete glyph-danger',
                glyph: 0xf056, // fa-minus-circle
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
