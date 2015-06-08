/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.locations.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'settings-locations-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    allowDeselect: true,
    store: 'settings.LocationsTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Location',
        flex: 1,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: 'textfield'
    }],
    tbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Location',
        action: 'create-location'
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