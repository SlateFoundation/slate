/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.Person', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
        'Ext.data.validator.Presence'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        // person fields
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
            allowNull: true
        },
        {
            name: 'CreatorID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'PrimaryPhotoID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'PrimaryEmailID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'PrimaryPhoneID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'PrimaryPostalID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'FirstName'
        },
        {
            name: 'LastName'
        },
        {
            name: 'MiddleName',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'PreferredName',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'FullName',
            depends: ['FirstName', 'LastName'],
            convert: function(v,r) {
                return r.get('FirstName') + ' ' + r.get('LastName');
            }
        },
        {
            name: 'Gender',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'BirthDate',
            type: 'date',
            dateFormat: 'Y-m-d',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'About',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'Location',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'groupIDs',
            allowNull: true,
            defaultValue: null
        },


        // user fields
        {
            name: 'Username',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'AccountLevel',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'TemporaryPassword',
            allowNull: true,
            defaultValue: null
        },


        // student fields
        {
            name: 'StudentNumber',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'Advisor',
            allowNull: true,
            defaultValue: null,
            sortType: function(v) {
                return v ? v.LastName : '_';
            }
        },
        {
            name: 'AdvisorID',
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'GraduationYear',
            type: 'integer',
            allowNull: true,
            defaultValue: null
        }
    ],

    validators: {
        FirstName: 'presence',
        LastName: 'presence'
    },

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
