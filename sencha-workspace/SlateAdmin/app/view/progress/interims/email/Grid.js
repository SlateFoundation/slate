Ext.define('SlateAdmin.view.progress.interims.email.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-email-grid',
    requires: [
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

            header: 'Recipients',
            dataIndex: 'recipients',
            renderer: function (v) {
                if (!v || !v.length) {
                    return '<em>No recipients</em>';
                }

                v = Ext.Array.map(v, function (recipient) {
                    return recipient.replace(/"/g, '').replace(/<(.*)>/g, '<span class="recipient-contact">$1</span>');
                });

                return '<ul class="recipients-list"><li>' + v.join('</li><li>') + '</li></ul>';
            }
        }
    ],
    bbar: [
        { xtype: 'tbfill' },
        {
            xtype: 'tbtext',
            itemId: 'interimEmailTotalText',
            text: '0 Reports'
        },
        {
            xtype: 'button',
            text: 'Send All Emails',
            action: 'interim-email-send'
        }
    ]
});
