/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.assignments.WorksheetForm', {
    extend: 'Ext.form.Panel',
    xtype: 'sbg-standards-assignments-worksheetform',

    disabled: true,
    componentCls: 'sbg-standards-assignments-worksheetform',
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
