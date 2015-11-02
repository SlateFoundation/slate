/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.Reports',{
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.progress.narratives.Report',
    autoLoad: false,
    autoSync: false
});