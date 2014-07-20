/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.courses.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'courses-grid',
    requires: [
        'Ext.grid.column.Template'
    ],


    // grid config
    store: 'courses.Sections',
    columnLines: true,
    viewConfig: {
        emptyText: '<div class="emptyText">No course sections found</div>',
        deferEmptyText: false
    },

    features: [{
        ftype: 'grouping',
        groupHeaderTpl: [
            '{% values.course = Ext.getStore(\'courses.Sections\').getRelatedCourse(values.groupValue) %}',
            '<tpl for="course && course.getData()">',
                '<span class="course-title">{Title}</span>',
                '<span class="course-code" style="float: right">{Code}</span>',
            '</tpl>'
        ]
    }],

    columns: {
        defaults: {
            menuDisabled: true
        },
        items: [{
            id: 'Title',
            dataIndex: 'Title',
            header: 'Title',
            flex: 1,
            sortable: true
        },{
            id: 'Code',
            dataIndex: 'Code',
            header: 'Code',
            sortable: true,
            width: 90
        },{
            id: 'Term',
            dataIndex: 'Term',
            header: 'Term',
            sortable: true,
            width: 80,
            renderer: function(v,m,r){
                if(v)
                    return v.Title;
            }
        },{
            id: 'Schedule',
            dataIndex: 'Schedule',
            header: 'Schedule',
            sortable: true,
            width: 80,
            renderer: function(v,m,r){
                if(v)
                    return v.Title;
            }
        },{
            id: 'Location',
            dataIndex: 'Location',
            header: 'Location',
            sortable: true,
            width: 80,
            renderer: function(v,m,r){
                if(v)
                    return v.Title;
            }
        },{
            id: 'StudentsCapacity',
            dataIndex: 'StudentsCapacity',
            header: 'Capacity',
            sortable: true,
            width: 80
        }]
    }
});