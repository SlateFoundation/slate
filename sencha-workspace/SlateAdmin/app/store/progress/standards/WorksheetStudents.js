/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.standards.WorksheetStudents', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.SectionStudent'
    ],

    model: 'SlateAdmin.model.progress.SectionStudent',
    pageSize: false
});
