/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.interims.Emails', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.interim.Email'
    ],
    model: 'SlateAdmin.model.progress.interim.Email'
});