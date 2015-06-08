/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.settings.courses.Courses', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Course',
    autoSync: true,
    proxy: {
        type: 'slaterecords',
        url: '/courses',
        include: ['Department'],
        startParam: false,
        limitParam: false
    }
});