Ext.define('EmergenceEditor.store.FilesystemTree', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'EmergenceEditor.API',
        'Jarvus.proxy.API'
    ],


    model: 'EmergenceEditor.model.FilesystemNode',

    config: {
        nodeParam: null,

        sorters: [
            {
                property: 'leaf',
                direction: 'ASC'
            },
            {
                property: 'Local',
                direction: 'ASC'
            },
            {
                property: 'Handle',
                direction: 'ASC'
            }
        ],

        root: {
            text: 'children',
            id: 'children',
            expanded: true
        },

        proxy: {
            type: 'api',
            connection: 'EmergenceEditor.API',
            url: function(operation) {
                var node = operation.node;

                return '/develop/json/' + (node.isRoot() ? '' : node.get('FullPath'));
            }
        }
    }
});