/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Sections', {
    extend: 'Ext.data.Store',
    alias: 'store.sections',
    requires: [
        'SlateAdmin.model.Section'
    ],

    model: 'SlateAdmin.model.Section',
    pageSize: 100,
    groupField: 'CourseTitle',
    buffered: true
});