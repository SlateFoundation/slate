Ext.define('EmergenceEditor.store.SearchResults', {
    extend: 'Ext.data.Store',
    alias: 'store.emergence-searchresults',
    requires: [
        'EmergenceEditor.API',
        'Jarvus.proxy.API'
    ],


    model: 'EmergenceEditor.model.SearchResult',

    config: {
        proxy: {
            type: 'api',
            connection: 'EmergenceEditor.API',
            url: '/editor/search',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        },

        sorters: [
            {
                property: 'Local',
                direction: 'DESC'
            },
            {
                property: 'Path',
                direction: 'ASC'
            },
            {
                property: 'LineNumber',
                direction: 'ASC'
            }
        ]
    }
});