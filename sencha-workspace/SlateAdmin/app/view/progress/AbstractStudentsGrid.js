/**
 * @abstract
 * Shared students grid for the progress report authoring sections;
 * subclasses set xtype/cls and their module's Students store.
 */
Ext.define('SlateAdmin.view.progress.AbstractStudentsGrid', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Ext.grid.column.Date'
    ],


    width: 250,

    viewConfig: {
        getRowClass: function(student) {
            return 'status-' + (student.get('report_status') || 'pending').toLowerCase();
        },
        emptyText: 'You are not currently an instructor for any students',
        loadingText: 'Loading students&hellip;'
    },
    columns: [
        {
            flex: 1,

            text: 'Student',
            dataIndex: 'SortName'
        },
        {
            width: 80,

            text: 'Status',
            dataIndex: 'report_status',
            emptyCellText: '&mdash;'
        },
        {
            width: 148,

            xtype: 'datecolumn',
            text: 'Last Modified',
            dataIndex: 'report_modified',
            format: 'n/j/y g:i A',
            emptyCellText: '&mdash;'
        }
    ]
});
