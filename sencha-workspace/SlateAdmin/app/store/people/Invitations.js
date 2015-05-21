/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.Invitations', {
    extend: 'Ext.data.Store',

    fields: [{
        name: 'Person'
    },{
        name: 'FirstName',
        convert: function(v, r) {
            return r.get('Person').get('FirstName');
        }
    },{
        name: 'LastName',
        convert: function(v, r) {
            return r.get('Person').get('LastName');
        }
    },{
        name: 'Email',
        convert: function(v, r) {
            return r.get('Person').get('Email');
        }
    },{
        name: 'selected',
        type: 'boolean',
        defaultValue: false
    }]
});