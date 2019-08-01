Ext.define('SlateAdmin.store.people.Classes', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.API'
    ],


    model: 'Emergence.model.RecordClass',
    proxy: {
        type: 'slateapi',
        url: '/people/*classes',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});