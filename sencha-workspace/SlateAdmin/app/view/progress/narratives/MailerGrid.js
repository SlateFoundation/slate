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
            return '<ul class="recipients-list"><li>' + val.join('</li><li>') + '</li></ul>';
        },
        flex: 1
    }],
    bbar: [{
        xtype: 'tbfill'
    },{
        xtype: 'tbtext',
        itemId: 'total',
        text: '0 Reports'
    },{
        xtype: 'button',
        text: 'Send All Emails',
        action: 'send-all'
    }]
});
