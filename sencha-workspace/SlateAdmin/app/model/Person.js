/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Person', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    parentNode: null,


    // model config
    idProperty: 'ID',
    
    fields: [
        'Username',
        'FirstName',
        'LastName',
        'AccountLevel',
        'Email',
        'Phone',
        'StudentNumber',
        'groupIDs',
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            defaultValue: 'Product'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true
        },
        {
            name: 'CreatorID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'PrimaryPhotoID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'PrimaryEmailID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'PrimaryPhoneID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'PrimaryPostalID',
            type: 'integer',
            useNull: true
        },
        {
            name: 'Advisor',
            useNull: true,
            sortType: function(v) {
                return v ? v.LastName : '_';
            }
        },
        {
            name: 'AdvisorID',
            useNull: true
        },
        {
            name: 'GraduationYear',
            type: 'integer',
            useNull: true
        },
        {
            name: 'FullName',
            convert: function(v,r) {
                return r.get('FirstName') + ' ' + r.get('LastName');
            }
        }
    ],
    
    validations: [
        {
            type: 'presence',
            field: 'FirstName'
        },
        {type: 'presence',  field: 'LastName'}
    ],

    proxy: {
        type: 'slaterecords',
        url: '/people',
        include: 'groupIDs'
    },


    // model methods
    getFullName: function() {
        return this.get('FirstName') + ' ' + this.get('LastName');
    },

    getDisplayName: function() {
        var me = this,
            firstName = me.get('FirstName'),
            lastName = me.get('LastName'),
            email = me.get('Email'),
            id = me.get('ID');

        if (firstName && lastName) {
            return firstName + ' '+ lastName;
        } else if(firstName) {
            return firstName;
        } else if(email) {
            return email;
        } else {
            return 'Person #'+id;
        }
    },

    getLink: function() {
        var me = this,
            displayName = me.getDisplayName(),
            url = me.toUrl();
        
        return url ? '<a href="#'+url+'">'+displayName+'</a>' : displayName;
    },
    
    toUrl: function() {
        var me = this;
        
        if (me.phantom) {
            return null;
        } else if (me.get('Username')) {
            return 'people//'+me.get('Username');
        } else {
            return 'people//?id='+me.get('ID');
        }
    }
});