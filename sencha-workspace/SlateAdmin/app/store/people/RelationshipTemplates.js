/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.RelationshipTemplates', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.person.RelationshipTemplate',
        'SlateAdmin.proxy.API'
    ],

    model: 'SlateAdmin.model.person.RelationshipTemplate',

    proxy: {
        type: 'slateapi',
        url: '/relationships/*templates',
        pageParam: false,
        startParam: false,
        limitParam: false,
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});