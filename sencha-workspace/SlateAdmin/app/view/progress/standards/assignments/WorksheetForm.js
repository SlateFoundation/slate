/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.assignments.WorksheetForm', {
    extend: 'Ext.form.Panel',
    xtype: 'progress-standards-assignments-worksheetform',

    disabled: true,
    componentCls: 'progress-standards-assignments-worksheetform',
    border: false,
    title: '&laquo; Select student to load worksheet',
    autoScroll: true,
    bodyPadding: 10,
    fieldDefaults: {
        forceSelection: true,
        width: 50
    },
    buttonAlign: 'center',
    buttons: [{
        text: 'Save',
        scale: 'large',
        action: 'saveWorksheetForm'
    }]
});
