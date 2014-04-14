/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.SectionStudents', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.Person'
    ],

    model: 'SlateAdmin.model.Person',
    autoSync: true,
    pageSize: false
});
