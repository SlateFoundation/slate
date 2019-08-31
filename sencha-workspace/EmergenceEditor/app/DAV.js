Ext.define('EmergenceEditor.DAV', {
    extend: 'Jarvus.util.DAVClient',
    singleton: true,
    requires: [
        'EmergenceEditor.API'
    ],


    config: {
        connection: 'EmergenceEditor.API',
        baseUri: '/develop'
    }
});