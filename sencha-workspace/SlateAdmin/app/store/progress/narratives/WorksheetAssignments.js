/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.WorksheetAssignments', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.Narrative'
    ],

    model: 'SlateAdmin.model.progress.narrative.WorksheetAssignment',
    autoSync: true,
    pageSize: false
});
