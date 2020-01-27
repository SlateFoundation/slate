Ext.define('SlateAdmin.view.settings.globalrecipients.Manager', {
    extend: 'Ext.grid.Panel',
    xtype: 'globalrecipients-manager',
    requires: [
        'SlateAdmin.widget.field.Person',
        'Ext.grid.plugin.CellEditing'
    ],

    store: 'people.GlobalRecipients',

    columns: [{
        text: 'Title',
        flex: 2,
        dataIndex: 'Title',
        editor: {
            xtype: 'textfield'
        }
    },{
        xtype:'templatecolumn',
        text: 'Person',
        flex: 1,
        dataIndex: 'PersonID',
        tpl: '<tpl for="Person">{FirstName} {LastName}</tpl>',
        getSortParam: function() {
            return 'Person';
        },
        editor: {
            xtype: 'slate-personfield',
            valueField: 'ID',
            listeners: {
                select: function(comboField) {
                    comboField.up('editor').completeEdit();
                }
            }
        }
    },{
        xtype: 'actioncolumn',
        dataIndex: 'Class',
        width: 50, // n*15+20
        align: 'end',
        items: [
            {
                action: 'view',
                glyph: 0xf06e, // fa-eye // 0xf0ca, // fa-list-ul
                tooltip: 'View Profile'
            },
            {
                action: 'delete',
                iconCls: 'glyph-danger',
                glyph: 0xf056, // fa-minus-circle
                tooltip: 'Delete Global Recipient'
            }
        ]
    }],
    bbar: [{
        xtype: 'button',
        glyph: 0xf055, // fa-plus-circle,
        cls: 'glyph-success',
        text: 'Create Global Recipient',
        action: 'create'
    }],
    plugins: [{
        pluginId: 'cellediting',
        ptype: 'cellediting'
    }]
});
