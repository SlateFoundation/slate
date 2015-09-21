/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.standards.WorksheetAssignments', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.sbg.standard.WorksheetAssignment'
    ],

    model: 'SlateAdmin.model.sbg.standard.WorksheetAssignment',
    autoSync: true,
    pageSize: false
});
