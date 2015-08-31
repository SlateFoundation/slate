/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.standards.WorksheetAssignments', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.standard.WorksheetAssignment'
    ],

    model: 'SlateAdmin.model.progress.standard.WorksheetAssignment',
    autoSync: true,
    pageSize: false
});
