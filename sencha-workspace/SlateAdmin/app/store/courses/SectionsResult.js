/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.SectionsResult', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Section',
    groupField: 'CourseID',
//    pageSize: 100,
//    buffered: true, // buffering isn't getting along with grouping

    proxy: {
        type: 'slaterecords',
        url: '/sections',
        startParam: false,
        limitParam: false,
        include: ['StudentsCount'],
        extraParams: {
            q: ''
        }
    }
});