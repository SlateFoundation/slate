/*jslint browser: true, undef: true, laxbreak: true *//*global Ext*/
Ext.define('SlateAdmin.view.progress.narratives.MailerGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-mailergrid',

    store: 'progress.narratives.Reports',

    columns: [{
        header: 'First Name',
        dataIndex: 'StudentFirstName',
        sortable: true,
        width: 100
    },{
        header: 'Last Name',
        dataIndex: 'StudentLastName',
        sortable: true,
        width: 100
    },{
        header: 'Recipients',
        dataIndex: 'EmailRecipients',
        scope: this,
        renderer: function (val) {
            if (!val) {
                return 'No recipients';
            }

/*
            v = Ext.Array.map (v, function (recipient) {
                //return recipient.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                return recipient.replace(/"/g, "").replace(/<(.*)>/g, '<span class="recipient-contact">$1</span>');
            });
*/

            //return v.join('<br>');
            return '<ul class="recipients-list"><li>' + val.join('</li><li>') + '</li></ul>';
        },
        flex: 1
    }],
    bbar: [{
        xtype: 'tbfill'
    },{
        xtype: 'tbtext',
        itemId: 'interimEmailTotalText',
        text: '0 Reports'
    },{
        xtype: 'button',
        text: 'Send All Emails',
        action: 'interim-email-send'
    }]
});
