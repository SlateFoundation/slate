/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.narratives.WorksheetAssignments', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.sbg.Narrative'
    ],

    model: 'SlateAdmin.model.sbg.narrative.WorksheetAssignment',
    autoSync: true,
    pageSize: false
});
