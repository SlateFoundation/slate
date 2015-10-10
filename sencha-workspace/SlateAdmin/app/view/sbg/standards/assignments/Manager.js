/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.assignments.Manager', {
    extend: 'Ext.Container',
    xtype: 'sbg-standards-assignments-manager',
    requires: [
        'SlateAdmin.view.sbg.standards.assignments.Grid',
        'SlateAdmin.view.sbg.standards.assignments.StudentEditor',
        'SlateAdmin.view.sbg.standards.assignments.WorksheetForm'
    ],

    componentCls: 'sbg-standards-worksheets-manager',
    config: {
        section: null,
        student: null
    },
    layout: 'border',
    items: [{
        region: 'west',
        split: true,
        xtype: 'sbg-standards-assignments-grid',
        width: 250
    },{
        region: 'center',
        xtype: 'sbg-standards-assignments-studenteditor',
        width: 250
    },{
        region: 'east',
        split: true,
        xtype: 'sbg-standards-assignments-worksheetform',
        flex: 1
    }],


    //helper functions
    updateStudent: function (student) {
        var worksheetForm = this.down('sbg-standards-assignments-worksheetform');
        worksheetForm.setTitle(student.get('FirstName')+' '+student.get('LastName'));
        worksheetForm.removeAll();
    }
});
