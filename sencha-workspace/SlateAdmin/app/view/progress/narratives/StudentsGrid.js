/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.StudentsGrid',{
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-studentsgrid',
    requires: [
        'Ext.grid.column.Date'
    ],

    viewConfig: {
        getRowClass: function(record) {
            return 'status-'+record.get('Status');
        },
        emptyText: 'You are not currently an instructor for any students',
        loadingText: 'Loading students&hellip;'
    },
    store: 'progress.narratives.Students',
    columns: [{
        flex: 1,

        text: 'Student',
        dataIndex: 'FullName'
    // },{
    //     dataIndex: 'Grade',
    //     header: 'Grade',
    //     sortable: true,
    //     width: 60,
    //     align: 'center'
    },{
        width: 148,

        xtype: 'datecolumn',
        text: 'Updated',
        dataIndex: 'Updated',
        format: 'n/j/y g:h A',
        emptyCellText: '&mdash;'
    }]
});
