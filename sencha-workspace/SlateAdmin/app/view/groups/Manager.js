/*jslint browser: true, undef: true *//*global Ext*/
//TODO:  move to view.settings wih other settings managers
Ext.define('SlateAdmin.view.groups.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'groups-manager',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Jarvus.ext.actionevents.override.grid.column.ActionEvents',
        'Emergence.store.ChainedTree'
    ],

    rootVisible: false,
    store: {
        type: 'emergence-chainedtree',
        source: 'people.Groups'
    },
    viewConfig: {
        toggleOnDblClick: false
    },
    columns: [{
        xtype: 'treecolumn',
        text: 'Group',
        flex: 2,
        dataIndex: 'Name',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'namesPath',
        dataIndex: 'namesPath',
        flex: 4
    },{
        text: 'Code',
        width: 200,
        dataIndex: 'Handle',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Population',
        width: 100,
        dataIndex: 'Population'
    },{
        text: 'Group Type',
        width: 300,
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
        width: 65, // n*15+20
        align: 'end',
        items: [
            {
                action: 'browsemembers',
                glyph: 0xf06e, // fa-eye // 0xf0ca, // fa-list-ul
                tooltip: 'Browse Members'
            },
            {
                action: 'createsubgroup',
                iconCls: 'glyph-success',
                glyph: 0xf055, // fa-plus-circle
                tooltip: 'Create Subgroup'
            },
            {
                action: 'deletegroup',
                iconCls: 'glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Group'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        glyph: 0xf055, // fa-plus-circle,
        cls: 'glyph-success',
        text: 'Create Organization',
        action: 'create-organization'
    }],
    plugins: [{
        pluginId: 'cellediting',
        ptype: 'cellediting'
    }]
});
