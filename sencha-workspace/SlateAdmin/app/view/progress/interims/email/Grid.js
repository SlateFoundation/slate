Ext.define('SlateAdmin.view.progress.interims.email.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-email-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.toolbar.Fill'
    ],


    store: 'progress.interims.Emails',
    viewConfig: {
        emptyText: 'No report emails loaded, adjust filters and click "Load Report Emails" above to preview emails',
        deferEmptyText: false
    },
    columns: [
        {
            xtype: 'templatecolumn',

            header: 'Student Name',
            dataIndex: 'sortName',
            sortable: true,
            width: 200,
            tpl: [
                '<a href="#people/lookup/<tpl if="student.Username">{student.Username}<tpl else>?id={student.ID}</tpl>/contacts">',
                '    {sortName}',
                '</a>'
            ]
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
                '       <li class="status-{status}">{name} <span class="recipient-contact">{email}</span> ({relationship})</li>',
                '   </tpl>',
                '</ul>'
            ]
        }
    ]
});
