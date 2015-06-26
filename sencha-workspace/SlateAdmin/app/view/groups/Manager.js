/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.groups.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'groups-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
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
                iconCls: 'group-browse glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Browse Members',
                handler: function(view, rowIndex) {
                    var rec = view.getStore().getAt(rowIndex);
                    view.up('groups-manager').fireEvent('browsemembers',rec);
                }
            },
            {
                iconCls: 'group-create-subgroup glyph-danger',
                glyph: 0xf132, // fa-shield
                tooltip: 'Create Subgroup',
                handler: function(view, rowIndex) {
                    var rec = view.getStore().getAt(rowIndex);
                    view.up('groups-manager').fireEvent('createsubgroup',rec);
                }
            },
            {
                iconCls: 'group-delete glyph-danger',
                glyph: 0xf0f9, // fa-ambulance
                tooltip: 'Delete Group',
                handler: function(view, rowIndex) {
                    var rec = view.getStore().getAt(rowIndex);
                    view.up('groups-manager').fireEvent('deletegroup',rec);
                }
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
