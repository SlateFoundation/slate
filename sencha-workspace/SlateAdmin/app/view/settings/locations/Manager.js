Ext.define('SlateAdmin.view.settings.locations.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'locations-manager',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Emergence.store.ChainedTree'
    ],

    rootVisible: false,
    store: {
        type: 'emergence-chainedtree',
        source: 'Locations'
    },
    viewConfig: {
        toggleOnDblClick: false
    },
    columns: [{
        xtype: 'treecolumn',
        text: 'Location',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Code',
        width: 100,
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
        width: 65, // n*15+20
        align: 'end',
        items: [
            {
                action: 'browsecourses',
                glyph: 0xf06e, // fa-eye // 0xf0ca, // fa-list-ul
                tooltip: 'Browse Courses'
            },
            {
                action: 'createchild',
                iconCls: 'glyph-success',
                glyph: 0xf055, // fa-plus-circle
                tooltip: 'Create Sub-location'
            },
            {
                action: 'delete',
                iconCls: 'glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Location'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        glyph: 0xf055, // fa-plus-circle,
        cls: 'glyph-success',
        text: 'Create Location',
        action: 'create'
    }],
    plugins: [{
        pluginId: 'cellediting',
        ptype: 'cellediting'
    }]
});
