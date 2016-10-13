Ext.define('SlateAdmin.view.progress.interims.email.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-email-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.toolbar.Fill'
    ],


    store: 'progress.interims.Emails',
    columns: [
        {
            header: 'Last Name',
            dataIndex: 'lastName',
            sortable: true,
            width: 120
        },
        {
            header: 'First Name',
            dataIndex: 'firstName',
            sortable: true,
            width: 120
        },
        {
            header: 'Reports',
            dataIndex: 'reports',
            sortable: true,
            width: 75,
            renderer: function (v) {
                return v ? v.length : 0;
            }
        },
        {
            flex: 1,

            xtype: 'templatecolumn',
            header: 'Recipients',
            dataIndex: 'recipients',
            emptyCellText: 'No recipients',
            tpl: [
                '<ul class="recipients-list">',
                '   <tpl for="recipients">',
                '       <li>{name} <span class="recipient-contact">{email}</span> ({relationship})</li>',
                '   </tpl>',
                '</ul>'
            ]
        }
    ],
    bbar: [
        { xtype: 'tbfill' },
        {
            xtype: 'tbtext',
            itemId: 'emailsTotal',
            text: 'No reports loaded'
        },
        {
            xtype: 'button',
            text: 'Send All Emails',
            action: 'send-emails'
        }
    ]
});
