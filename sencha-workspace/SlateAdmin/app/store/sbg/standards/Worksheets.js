/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.standards.Worksheets', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.sbg.standard.Worksheet'
    ],

    model: 'SlateAdmin.model.sbg.standard.Worksheet',
    pageSize: false,
    autoSync: true
});
