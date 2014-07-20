/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.courses.Sections', {
    extend: 'Ext.data.Store',
    alias: 'store.sections',
    requires: [
        'SlateAdmin.model.course.Course'
    ],

    model: 'SlateAdmin.model.course.Section',
    groupField: 'CourseID',
    pageSize: 100,
    buffered: true,

    proxy: {
        type: 'slaterecords',
        url: '/sections',
        relatedTable: ['Course']
    },
    
    constructor: function() {
        var me = this,
            coursesStore;
        
        coursesStore = me.coursesStore = new Ext.data.Store({
            model: 'SlateAdmin.model.course.Course'
        });
        
        me.callParent(arguments);
        
        me.on('prefetch', function() {
            var rawData = me.getProxy().getReader().rawData,
                courses = rawData.related && rawData.related.Course;
            
            if (courses) {
                coursesStore.loadData(courses, true);
            }
        });
    },
    
    getRelatedCourse: function(courseId) {
        return this.coursesStore.getById(courseId);
    }
});