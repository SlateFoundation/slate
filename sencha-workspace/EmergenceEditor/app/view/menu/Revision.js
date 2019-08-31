Ext.define('EmergenceEditor.view.menu.Revision', {
    extend: 'Ext.menu.Menu',
    xtype: 'emergence-menu-revision',
    requires: [
        'Ext.menu.Separator',

        'EmergenceEditor.API'
    ],


    config: {
        revision: null,

        plain: true
    },

    items: [
        {
            text: 'Open',
            action: 'revision-open',
            iconCls: 'x-fa fa-file-o'
        },
        {
            text: 'Compare Latest',
            action: 'revision-compare-latest',
            iconCls: 'x-fa fa-fast-forward'
        },
        {
            text: 'Compare Next',
            action: 'revision-compare-next',
            iconCls: 'x-fa fa-arrow-up'
        },
        {
            text: 'Compare Previous',
            action: 'revision-compare-previous',
            iconCls: 'x-fa fa-arrow-down'
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
                '    <th>Author</th>',
                '    <td>',
                '        <a target="_blank" href="{[EmergenceEditor.API.buildUrl("/people/"+values.AuthorUsername)]}">',
                '            {Author.FirstName} {Author.LastName} <tpl if="Author.Email">&lt;{Author.Email}&gt;</tpl>',
                '        </a>',
                '    </td>',
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
    updateRevision: function(revision) {
        this.getComponent('detailsCmp').setData(revision.getData());

        // TODO: use hrefs on items instead of controller redirects
    }
});