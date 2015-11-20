/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.StudentsGrid',{
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-studentsgrid',
    requires: [
        'Ext.grid.column.Date'
    ],

    width: 250,
    cls: 'progress-narratives-studentsgrid',

    viewConfig: {
        getRowClass: function(student) {
            return 'status-' + (student.get('report_status') || 'pending').toLowerCase();
        },
        emptyText: 'You are not currently an instructor for any students',
        loadingText: 'Loading students&hellip;'
    },
    store: 'progress.narratives.Students',
    columns: [{
        flex: 1,

        text: 'Student',
        dataIndex: 'FullName'
    },{
        width: 80,

        text: 'Status',
        dataIndex: 'report_status',
        emptyCellText: '&mdash;'
    },{
        width: 148,

        xtype: 'datecolumn',
        text: 'Last Modified',
        dataIndex: 'report_modified',
        format: 'n/j/y g:i A',
        emptyCellText: '&mdash;'
    }]
});