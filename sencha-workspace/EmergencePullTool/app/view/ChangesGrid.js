Ext.define('EmergencePullTool.view.ChangesGrid', {
    extend: 'Ext.tree.Panel',
    xtype: 'app-changesgrid',
    requires: [
        'Ext.grid.column.Template'
    ],

    title: 'Parent files that have been updated remotely',
    store: 'ChangesTree',
    rootVisible: false,
    useArrows: true,
    bbar: [
        {
            xtype: 'component',
            itemId: 'selectionStatus',
            tpl: '{count} updates selected',
            data: {
                count: 0
            }
        },
        {
            xtype: 'button',
            action: 'selectall',
            text: 'Select all updates'
        },
        {
            xtype: 'button',
            action: 'pull',
            text: 'Pull remote versions',
            disabled: true
        }
    ],
    columns: [
        {
            xtype: 'treecolumn',
            dataIndex: 'handle',
            text: 'Path',
            align: 'left',
            flex: 1
        },
        {
            xtype: 'templatecolumn',
            dataIndex: 'localFile',
            tpl: '{localFile.SHA1:substr(0, 8)}',
            text: 'Local Version',
            width: 150
        },
        {
            xtype: 'templatecolumn',
            dataIndex: 'remoteFile',
            tpl: '<tpl if="remoteFile">{remoteFile.SHA1:substr(0, 8)}<tpl elseif="leaf"><em>DELETED</em></tpl>',
            text: 'Remote Version',
            width: 150
        }
    ]
});