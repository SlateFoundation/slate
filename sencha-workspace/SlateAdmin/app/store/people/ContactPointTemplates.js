Ext.define('SlateAdmin.store.people.ContactPointTemplates', {
    extend: 'Ext.data.Store',
    alias: 'store.contactpointtemplates',
    requires: [
        'Slate.proxy.API'
    ],

    idProperty: 'label',
    fields: [
        {
            name: 'label',
            type: 'string'
        },
        {
            name: 'class',
            type: 'string'
        },
        {
            name: 'placeholder',
            type: 'string',
            allowNull: true
        },
        {
            name: 'class',
            type: 'string',
            allowNull: true
        }
    ],

    proxy: {
        type: 'slate-api',
        url: '/contact-points/*templates',
        pageParam: false,
        startParam: false,
        limitParam: false,
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});