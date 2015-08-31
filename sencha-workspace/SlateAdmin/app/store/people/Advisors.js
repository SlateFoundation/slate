/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.people.Advisors', {
    extend: 'Ext.data.Store',
    
    model: 'SlateAdmin.model.person.Person',
    proxy: {
        type: 'slaterecords',
        url: '/advisors/json',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});
