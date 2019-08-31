Ext.define('EmergenceEditor.view.RevisionsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'emergence-revisionsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Number',
        'Ext.util.Format'
    ],


    title: 'Revision History',
    store: 'Revisions',
    componentCls: 'emergence-revisionsgrid',
    iconCls: 'x-fa fa-history',
    stateId: 'emergence-revisionsgrid',
    stateful: true,

    viewConfig: {
        getRowClass: function(record) {
            return 'status-'+record.get('Status');
        }
    },

    columns: [
        {
            header: 'Timestamp',
            dataIndex: 'Timestamp',
            width: 150,
            align: 'left',
            renderer: function(mtime) {
                var now = new Date(),
                    str = Ext.util.Format.date(mtime, 'g:i a'),
                    oneDay = 86400000; // 24 hr in ms

                // add date if mtime > 24 hours ago
                if (now.getTime() - mtime.getTime() > oneDay) {
                    str += ' &ndash; ';
                    str += Ext.util.Format.date(mtime, now.getYear() == mtime.getYear() ? 'M d' : 'M d Y');
                }

                return '<time datetime="'+Ext.util.Format.date(mtime, 'c')+'" title="'+Ext.util.Format.date(mtime, 'Y-m-d H:i:s')+'">'+str+'</time>';
            }
        }, {
            header: 'Author',
            dataIndex: 'AuthorUsername',
            align: 'left',
            flex: 1,
            xtype: 'templatecolumn',
            tpl: [
                '<tpl for="Author">',
                '    <abbr title="{FirstName} {LastName}<tpl if="Email"> <{Email}></tpl>" target="_blank">{Username}</abbr>',
                '</tpl>'
            ]
        }, {
            header: 'Size',
            dataIndex: 'Size',
            width: 60,
            align: 'left',
            xtype: 'templatecolumn',
            tpl: [
                '<tpl if="Status==\'Deleted\'">',
                '    DELETED',
                '</tpl>',
                '<tpl if="Status!=\'Deleted\'">',
                '    <abbr title="{Size} bytes">{Size:fileSize}</abbr>',
                '</tpl>'
            ]
        }
    ]
});