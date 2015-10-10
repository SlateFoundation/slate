/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.standards.Prompts', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.sbg.standard.Prompt'
    ],

    model: 'SlateAdmin.model.sbg.standard.Prompt',
    pageSize: false,
    autoSync: true
});
