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
    },{
        xtype: 'actioncolumn',
        dataIndex: 'Class',
        width: 54,
        items: [
            {
                action: 'browsecourses',
                border: '2px',
                iconCls: 'group-browse glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Browse Courses'
            },
            {
                action: 'createterm',
                iconCls: 'group-create-term glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Create Term'
            },
            {
                action: 'deleteterm',
                iconCls: 'group-delete glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Term'
            }
        ]
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
