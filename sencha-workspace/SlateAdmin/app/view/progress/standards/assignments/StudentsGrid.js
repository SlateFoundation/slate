/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.assignments.StudentsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-standards-assignments-studentsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Date',
        'Ext.grid.feature.Grouping',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox'
    ],

    store: 'progress.standards.WorksheetStudents',
    componentCls: 'progress-standards-assignments-studentsgrid',
    columns: [{
        header: 'Student',
        flex: 1,
        dataIndex: 'FirstName',
        renderer: function (v, metaData, record) {
            return record.get('FirstName')+' '+record.get('LastName');
        }
    },{
        header: 'Prompts Graded',
        dataIndex: 'PromptsGraded',
        width: 80,
        align: 'right',
        renderer: function (v,m,r) {
            return v + ' / ' + this.up('progress-standards-assignments-manager').getSection().get('Worksheet').TotalPrompts ;
        }
    }],
    viewConfig: {
        getRowClass: function (record){
            var c = record.get('PromptsGraded');

            if (c === 0) {
                return '';
            } else if (c < this.up('progress-standards-assignments-manager').getSection().get('Worksheet').TotalPrompts) {
                return 'status-Incomplete';
            } else {
                return 'status-Complete';
            }
        }
    },


    //helper functions
    setSection: function (section){
        this.loadedSection = section;
    }
});
