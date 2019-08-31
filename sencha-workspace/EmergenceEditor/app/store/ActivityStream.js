Ext.define('EmergenceEditor.store.ActivityStream', {
    extend: 'Ext.data.Store',
    requires: [
        'EmergenceEditor.API',
        'Jarvus.proxy.API'
    ],


    model: 'EmergenceEditor.model.ActivityEvent',

    config: {
        proxy: {
            type: 'api',
            connection: 'EmergenceEditor.API',
            url: '/editor/activity',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    }
});