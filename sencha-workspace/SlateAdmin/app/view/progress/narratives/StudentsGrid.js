/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.StudentsGrid',{
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-studentsgrid',

    viewConfig: {
        getRowClass: function(record) {
            return 'status-'+record.get('Status');
        },
        emptyText: 'You are not currently an instructor for any students'
    },
    store: 'progress.narratives.Reports',
    columns: [{
        xtype: 'templatecolumn',
        dataIndex: 'Student',
        flex: 1,
        tpl: '<tpl for="Student">{LastName}, {FirstName}</tpl>',
        header: 'Student',
        sortable: true,
        doSort: function (state) {
            var ds = this.up('grid').getStore();
            var field = this.getSortParam();

            ds.sort({
                property: field,
                direction: state,
                sorterFn: function (v1, v2){
                    v1 = v1.get(field).LastName;
                    v2 = v2.get(field).LastName;

                    return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
                }
            });
        }
    },{
        dataIndex: 'Grade',
        header: 'Grade',
        sortable: true,
        width: 60,
        align: 'center'
    },{
        dataIndex: 'Updated',
        header: 'Updated',
        width: 148,
        renderer: function (v, m, r) {
            if (!r.get('Updated')) {
                return 'Unsaved';
            }

            return Ext.Date.format(v, 'n/j/y g:h A');
        }
    }]
});
