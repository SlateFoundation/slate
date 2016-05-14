/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Slate.store.CourseSections', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.CourseSection',

    config: {
        pageSize: 0
    }
});