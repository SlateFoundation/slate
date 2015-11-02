/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.WorksheetAssignments', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.progress.narratives.WorksheetAssignment',
    autoSync: true,
    pageSize: false
});