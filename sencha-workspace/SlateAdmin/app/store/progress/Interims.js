/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.Interims', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.progress.Interim',
    grouped: true,
    groupers: [{
        property: 'CourseSectionID'
    }]
});
