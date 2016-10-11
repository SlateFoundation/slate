Ext.define('SlateAdmin.view.progress.interims.email.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-email-grid',
    requires: [
        'Ext.toolbar.Fill'
    ],


    store: 'progress.interims.Emails',
    columns: [
        {
            header: 'First Name',
            dataIndex: 'FirstName',
            sortable: true,
            width: 100
        },
        {
            header: 'Last Name',
            dataIndex: 'LastName',
            sortable: true,
            width: 100
        },
        {
            flex: 1,

            header: 'Recipients',
            dataIndex: 'Recipients',
            scope: this,
            renderer: function (v, m, r) {
                if (!v) {
                    return 'No recipients';
                }

                v = Ext.Array.map(v, function (recipient) {
                    //return recipient.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return recipient.replace(/"/g, '').replace(/<(.*)>/g, '<span class="recipient-contact">$1</span>');
                });

                //return v.join('<br>');
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
