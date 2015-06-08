/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.standards.Worksheets', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.standard.Worksheet'    
    ],

    model: 'SlateAdmin.model.progress.standard.Worksheet',
    pageSize: false,
    autoSync: true
});
