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
        renderer: function (recipients) {
            if (!recipients) {
                return 'No recipients';
            }

            var recipientText = '<ul class="recipients-list">',
                recipientCount = recipients.length,
                i = 0;

            if (recipientCount>0) {
                for (;i<recipientCount;i++) {
                    //recipientText += '<li>' + recipients[i].emailName+ '</li>';
                    recipientText += '<li>"' + recipients[i].emailName + '" &lt;' + recipients[i].emailAddress + '&gt;</li>';
                }
                recipientText += '</ul>';
                return recipientText;
            }
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
