/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.courses.sections.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'courses-sections-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.feature.Grouping'
    ],


    // grid config
    store: 'courses.SectionsResult',

    viewConfig: {
        emptyText: '<div class="emptyText">No course sections found</div>',
        deferEmptyText: true
    },

    features: [{
        ftype: 'grouping',
        collapsible: false,
        groupHeaderTpl: [
            '{% var coursesCache = Ext.getStore("courses.Courses") %}',
            '{% values.course = coursesCache && coursesCache.getById(values.groupValue) %}',
            '<tpl if="course">',
                '<tpl for="course.getData()">',
                    '<span class="course-title">',
                        '{Title} ',
                        '<tpl if="parent.children.length &gt; 1"><small class="muted">({[parent.children.length]})</small></tpl>',
                    '</span>',
                    '<small class="course-code pull-right">{Code}</span>',
                '</tpl>',
            '<tpl else>',
                'Course #{groupValue}',
            '</tpl>'
        ]
    }],

    columns: {
        defaults: {
            menuDisabled: true
        },
        items: [{
            dataIndex: 'Title',
            header: 'Title',
            flex: 1,
            sortable: true
        },{
            dataIndex: 'Code',
            header: 'Code',
            sortable: true,
            width: 100
        },{
            dataIndex: 'TermID',
            header: 'Term',
            sortable: true,
            width: 120,
            renderer: function(v) {
                v = v && Ext.getStore('Terms').getById(v);
                return v ? v.get('Title') : '';
            }
        },{
            dataIndex: 'ScheduleID',
            header: 'Schedule',
            sortable: true,
            width: 80,
            renderer: function(v) {
                v = v && Ext.getStore('courses.Schedules').getById(v);
                return v ? v.get('Title') : '';
            }
        },{
            dataIndex: 'LocationID',
            header: 'Location',
            sortable: true,
            width: 120,
            renderer: function(v) {
                v = v && Ext.getStore('Locations').getById(v);
                return v ? v.get('Title') : '';
            }
        },{
            dataIndex: 'StudentsCount',
            header: 'Students',
            sortable: true,
            width: 80
        },{
            dataIndex: 'StudentsCapacity',
            header: 'Capacity',
            sortable: true,
            width: 80
        }]
    }
});