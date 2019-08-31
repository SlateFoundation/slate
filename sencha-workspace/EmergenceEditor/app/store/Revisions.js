Ext.define('EmergenceEditor.store.Revisions', {
    extend: 'Ext.data.Store',
    requires: [
        'EmergenceEditor.API',
        'Jarvus.proxy.API'
    ],


    model: 'EmergenceEditor.model.Revision',

    config: {
        sorters: [{
            property: 'Timestamp',
            direction: 'DESC'
        }],

        proxy: {
            type: 'api',
            connection: 'EmergenceEditor.API',
            url: '/editor/revisions',
            reader: {
                type: 'json',
                rootProperty: 'revisions'
            }
        }
    }
});