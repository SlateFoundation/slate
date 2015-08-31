/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.standards.Prompts', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.standard.Prompt'
    ],

    model: 'SlateAdmin.model.progress.standard.Prompt',
    pageSize: false,
    autoSync: true
});
