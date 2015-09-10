/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.assignments.Manager', {
    extend: 'Ext.Container',
    xtype: 'progress-standards-assignments-manager',
    requires: [
        'SlateAdmin.view.progress.standards.assignments.Grid',
        'SlateAdmin.view.progress.standards.assignments.StudentEditor',
        'SlateAdmin.view.progress.standards.assignments.WorksheetForm'
    ],

    componentCls: 'progress-standards-worksheets-manager',
    config: {
        section: null,
        student: null
    },
    layout: 'border',
    items: [{
        region: 'west',
        split: true,
        xtype: 'progress-standards-assignments-grid',
        width: 250
    },{
        region: 'center',
        xtype: 'progress-standards-assignments-studenteditor',
        width: 250
    },{
        region: 'east',
        split: true,
        xtype: 'progress-standards-assignments-worksheetform',
        flex: 1
    }],


    //helper functions
    updateStudent: function (student) {
        var worksheetForm = this.down('progress-standards-assignments-worksheetform');
        worksheetForm.setTitle(student.get('FirstName')+' '+student.get('LastName'));
        worksheetForm.removeAll();
    }
});
