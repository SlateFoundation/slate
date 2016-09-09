/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.People', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.person.Person',
    proxy: {
        type: 'slaterecords',
        url: '/people',
        startParam: false,
        limitParam: false,
        include: ['groupIDs','Advisor']
    }
});