/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.Students', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    model: 'SlateAdmin.model.person.Person',
    pageSize: false,
    proxy: {
        type: 'slaterecords'
    }
});