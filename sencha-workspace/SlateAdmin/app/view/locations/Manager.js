/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.locations.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'locations-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'LocationsTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Location',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Population',
        width: 100,
        dataIndex: 'Population'
    },{
        text: 'Location Type',
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
        text: 'Create Location',
        action: 'create-location'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});