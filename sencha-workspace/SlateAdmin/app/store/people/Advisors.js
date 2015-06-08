/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.people.Advisors', {
    extend: 'Ext.data.Store',
    
    model: 'SlateAdmin.model.person.Person',
    proxy: {
        type: 'ajax',
        url: '/advisors/json',
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
