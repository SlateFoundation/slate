/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.settings.courses.Departments', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Department',
    autoSync: true,
    proxy: {
        type: 'slaterecords',
        url: '/departments'
    }
});