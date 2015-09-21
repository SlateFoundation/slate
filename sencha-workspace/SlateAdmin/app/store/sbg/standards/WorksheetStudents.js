/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.standards.WorksheetStudents', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.sbg.SectionStudent'
    ],

    model: 'SlateAdmin.model.sbg.SectionStudent',
    pageSize: false
});
