Ext.define('EmergenceEditor.view.menu.Collection', {
    extend: 'Ext.menu.Menu',
    xtype: 'emergence-menu-collection',


    config: {
        node: null
    },

    items: [
        {
            text: 'New File',
            action: 'new-file',
            iconCls: 'x-fa fa-file-o'
        },
        {
            text: 'New Collection',
            action: 'new-collection',
            iconCls: 'x-fa fa-folder'
        },
        {
            text: 'Refresh',
            action: 'refresh',
            iconCls: 'x-fa fa-refresh'
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
        }
    ],


    // config handlers
    updateNode: function(collection) {
        var me = this,
            isLocal = collection.get('Site') == 'Local';

        me.child('[action=rename]').setDisabled(!isLocal);
        me.child('[action=delete]').setDisabled(!isLocal);
    }
});