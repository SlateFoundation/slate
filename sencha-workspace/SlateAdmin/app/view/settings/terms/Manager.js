/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.terms.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'settings-terms-manager',
    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    useArrows: true,
    rootVisible: false,
    allowDeselect: true,
    store: 'settings.TermsTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Term',
        flex: 1,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    }, {
        text: 'Start',
        width: 100,
        dataIndex: 'StartDate',
        renderer: Ext.util.Format.dateRenderer('n/j/Y'),
        editor: {
            xtype: 'datefield',
            submitFormat: 'U'
        }
    }, {
        text: 'End',
        width: 100,
        renderer: Ext.util.Format.dateRenderer('n/j/Y'),
        dataIndex: 'EndDate',
        editor: {
            xtype: 'datefield',
            submitFormat: 'U'
        }
    }, {
        text: 'Status',
        width: 100,
        dataIndex: 'Status',
        editor: {
            xtype: 'combo',
            displayField: 'name',
            store: {
                fields: ['name'],
                data: [
                    {name: 'Live'},
                    {name: 'Hidden'},
                    {name: 'Deleted'}
                ]
            }
        }
    }],
    tbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Term',
        action: 'create-term'
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