/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.terms.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'terms-manager',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Date',
        'Ext.grid.column.Date'
    ],

    useArrows: true,
    rootVisible: false,
    store: 'TermsTree',
    columns: [{
        xtype: 'treecolumn',
        text: 'Term',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Start Date',
        xtype: 'datecolumn',
        format :'Y-m-d',
        width: 160,
        dataIndex: 'StartDate',
        editor: {
            xtype: 'datefield',
            format :'Y-m-d'
        }
    },{
        text: 'End Date',
        xtype: 'datecolumn',
        format :'Y-m-d',
        width: 160,
        dataIndex: 'EndDate',
        editor: {
            xtype: 'datefield',
            format :'Y-m-d'
        }
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
                    {name: 'Hidden'},
                    {name: 'Live'},
                    {name: 'Deleted'}
                ]
            }
        }
    }],
    bbar: [{
        xtype: 'button',
        icon: '/img/icons/fugue/bank--plus.png',
        text: 'Create Term',
        action: 'create-term'
    }],
    plugins: [{
        ptype: 'cellediting'
    }]
});
