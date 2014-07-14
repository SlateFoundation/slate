/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.Sections', {
    extend: 'Ext.data.Store',
    alias: 'store.sections',

    model: 'SlateAdmin.model.course.Section',
    pageSize: 100,
    groupField: 'CourseTitle',
    buffered: true
});