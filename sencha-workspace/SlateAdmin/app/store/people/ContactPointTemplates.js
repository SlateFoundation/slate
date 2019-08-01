/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.ContactPointTemplates', {
    extend: 'Ext.data.Store',
    alias: 'store.contactpointtemplates',
    requires: [
        'SlateAdmin.proxy.API'
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
        type: 'slateapi',
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