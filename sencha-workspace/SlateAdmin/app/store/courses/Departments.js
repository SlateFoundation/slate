/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.Departments', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Department',
    proxy: {
        type: 'slaterecords',
        url: '/departments',
        startParam: false,
        limitParam: false
    }
});