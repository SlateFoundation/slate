/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.people.Advisors', {
    extend: 'Ext.data.Store',

    model: 'Slate.model.person.Person',
    proxy: {
        type: 'slaterecords',
        url: '/people/*advisors',
        startParam: false,
        limitParam: false
    }
});
