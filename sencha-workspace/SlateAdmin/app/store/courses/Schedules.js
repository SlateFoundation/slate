/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.Schedules', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Schedule',
    proxy: {
        type: 'slaterecords',
        url: '/schedules',
        startParam: false,
        limitParam: false
    }
});