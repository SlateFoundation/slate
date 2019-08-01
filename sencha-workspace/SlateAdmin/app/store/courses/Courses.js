/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.Courses', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Course',
    proxy: {
        type: 'slaterecords',
        url: '/courses',
        startParam: false,
        limitParam: false
    }
});