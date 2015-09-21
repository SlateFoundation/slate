/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.sbg.narratives.People', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.person.Person'
    ],

    model: 'SlateAdmin.model.person.Person',
    pageSize: false
});
