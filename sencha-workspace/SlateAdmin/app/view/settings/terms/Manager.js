/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.terms.Manager', {
    extend: 'Ext.tree.Panel',
    xtype: 'terms-manager',
    requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Date',
        'Ext.grid.column.Date',
        'Emergence.store.ChainedTree'
    ],

    rootVisible: false,
    store: {
        type: 'emergence-chainedtree',
        source: 'Terms',
        sorters: [{
            property: 'masterStartDate',
            direction: 'DESC'
        },{
            property: 'Left',
            direction: 'ASC'
        }]
    },
    viewConfig: {
        toggleOnDblClick: false
    },
    columns: [{
        xtype: 'treecolumn',
        text: 'Term',
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
        text: 'masterStartDate',
        xtype: 'datecolumn',
        format :'Y-m-d',
        width: 160,
        dataIndex: 'masterStartDate'
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
        align: 'end',
        items: [
            {
                action: 'browsecourses',
                glyph: 0xf14c, // fa-external-link-sign
                tooltip: 'Browse Courses'
            },
            {
                action: 'createterm',
                iconCls: 'glyph-success',
                glyph: 0xf055, // fa-plus-circle
                tooltip: 'Create Term'
            },
            {
                action: 'deleteterm',
                iconCls: 'glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Term'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        glyph: 0xf055, // fa-plus-circle,
        cls: 'glyph-success',
        text: 'Create Term',
        action: 'create-term'
    }],
    plugins: [{
        pluginId: 'cellediting',
        ptype: 'cellediting'
    }]
});
