/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.SectionStudents', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.courses.Person',
    autoSync: true,
    pageSize: false
});
