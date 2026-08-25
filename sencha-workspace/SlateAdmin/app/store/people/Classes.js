Ext.define('SlateAdmin.store.people.Classes', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.API'
    ],


    model: 'Emergence.model.RecordClass',
    proxy: {
        type: 'slate-api',
        url: '/people/*classes',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});