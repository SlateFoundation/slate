Ext.define('SlateAdmin.view.settings.locations.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'locations-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    rootVisible: false,
    store: 'LocationsTree',
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
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});
