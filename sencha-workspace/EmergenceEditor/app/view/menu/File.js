Ext.define('EmergenceEditor.view.menu.File', {
    extend: 'Ext.menu.Menu',
    xtype: 'emergence-menu-file',
    requires: [
        'Ext.menu.Separator',

        /* global EmergenceEditor */
        'EmergenceEditor.API'
    ],


    config: {
        node: null,

        plain: true
    },

    items: [
        {
            text: 'Edit',
            action: 'edit',
            iconCls: 'x-fa fa-pencil',
            href: '#'
        },
        {
            text: 'Open via Browser',
            action: 'open-file',
            iconCls: 'x-fa fa-external-link',
            hrefTarget: '_blank',
            href: '#'
        },
        {
            text: 'Open via Site',
            action: 'open-url',
            iconCls: 'x-fa fa-globe',
            hrefTarget: '_blank',
            href: '#'
        },
        {
            text: 'Rename',
            action: 'rename',
            iconCls: 'x-fa fa-i-cursor'
        },
        {
            text: 'Delete',
            action: 'delete',
            iconCls: 'x-fa fa-trash'
        },
        {
            xtype: 'menuseparator'
        },
        {
            itemId: 'detailsCmp',

            xtype: 'component',
            autoEl: 'table',
            cls: 'attributes-table',
            tpl: [
                '<tr>',
                '    <th>ID</th>',
                '    <td>{ID}</td>',
                '</tr>',
                '<tr>',
                '    <th>Modified</th>',
                '    <td>{Timestamp:date("Y-m-d H:i:s")}</td>',
                '</tr>',
                '<tr>',
                '    <th>Size</th>',
                '    <td>{Size:number("0,000")} bytes</td>',
                '</tr>',
                '<tr>',
                '    <th>Hash</th>',
                '    <td>{SHA1:substr(0,8)}</td>',
                '</tr>',
                '<tr>',
                '    <th>Type</th>',
                '    <td>{Type}</td>',
                '</tr>'
            ]
        }
    ],


    // config handlers
    updateNode: function(file) {
        var me = this,
            editItem = me.child('[action=edit]'),
            openFileItem = me.child('[action=open-file]'),
            openUrlItem = me.child('[action=open-url]'),
            isLocal = file.parentNode.get('Site') == 'Local',
            filePath = file.get('FullPath'),
            editToken = '#/'+filePath,
            openUrl = EmergenceEditor.API.buildUrl('/develop/'+filePath),
            rootHandle = filePath.replace(/^(_parent\/)?([^\/]+).*$/, '$2'),
            launchUrl;

        if (editItem.rendered) {
            editItem.itemEl.set({
                href: editToken
            });
        } else {
            editItem.href = editToken;
        }

        if (openFileItem.rendered) {
            openFileItem.itemEl.set({
                href: openUrl
            });
        } else {
            openFileItem.href = openUrl;
        }

        // TODO: create plugin architecture for tree-specific helpers
        if (rootHandle == 'site-root') {
            launchUrl = EmergenceEditor.API.buildUrl('/'+filePath.replace(/^(_parent\/)?site-root\/(.*?)(\.php)?$/, '$2'));
            openUrlItem.setText('Open via Site');
            openUrlItem.show();
        } else if (rootHandle == 'site-tasks') {
            launchUrl = EmergenceEditor.API.buildUrl('/site-admin/tasks/'+filePath.replace(/^(_parent\/)?site-tasks\/(.*?)(\.php)?$/, '$2'));
            openUrlItem.setText('Launch Task');
            openUrlItem.show();
        } else if (rootHandle == 'html-templates') {
            launchUrl = EmergenceEditor.API.buildUrl('/template/'+filePath.replace(/^(_parent\/)?html-templates\/(.*?)(\.tpl)?$/, '$2'));
            openUrlItem.setText('Preview Template');
            openUrlItem.show();
        } else {
            openUrlItem.hide();
        }

        if (launchUrl) {
            if (openUrlItem.rendered) {
                openUrlItem.itemEl.set({
                    href: launchUrl
                });
            } else {
                openUrlItem.href = launchUrl;
            }
        }

        me.child('[action=rename]').setDisabled(!isLocal);
        me.child('[action=delete]').setDisabled(!isLocal);

        me.getComponent('detailsCmp').setData(file.getData());
    }
});