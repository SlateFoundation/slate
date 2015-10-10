/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.assignments.StudentEditor', {
    extend: 'Ext.form.Panel',
    xtype: 'sbg-standards-assignments-studenteditor',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Date',
        'Ext.grid.feature.Grouping',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'SlateAdmin.view.sbg.standards.assignments.StudentsGrid'
    ],

    disabled: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    componentCls: 'sbg-standards-assignments-studentseditor',
    items: [{
        xtype: 'textareafield',
        enableKeyEvents: true,
        emptyText: 'Assignment Description (optional)',
        name: 'Description'
    },{
        xtype: 'sbg-standards-assignments-studentsgrid',
        flex: 1
    }]
});
