/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.Groups', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.person.Group',
    proxy: {
        type: 'slaterecords',
        url: '/groups',
        startParam: false,
        limitParam: false,
        include: 'Population',
        extraParams: {
            parentGroup: 'any'
        }
    }
});