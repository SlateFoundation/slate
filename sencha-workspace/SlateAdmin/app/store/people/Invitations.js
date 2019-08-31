Ext.define('SlateAdmin.store.people.Invitations', {
    extend: 'Ext.data.Store',

    fields: [{
        name: 'Person'
    }, {
        name: 'FirstName',
        convert: function(v, r) {
            return r.get('Person').get('FirstName');
        }
    }, {
        name: 'LastName',
        convert: function(v, r) {
            return r.get('Person').get('LastName');
        }
    }, {
        name: 'Email',
        convert: function(v, r) {
            var email = r.get('Person').get('PrimaryEmail');

            return email ? email.Data : null;
        }
    }, {
        name: 'selected',
        type: 'boolean',
        defaultValue: false
    }, {
        name: 'UserClass'
    }, {
        name: 'Invitation'
    }]
});