Ext.define('EmergencePullTool.store.ChangesTree', {
    extend: 'Ext.data.TreeStore',

    root: {
        expanded: true,
        children: []
    },

    fields: [
        { name: 'handle',
            type: 'string' },
        { name: 'path',
            type: 'string',
            useNull: true },
        { name: 'localFile',
            useNull: true },
        { name: 'remoteFile',
            useNull: true }
    ]
});