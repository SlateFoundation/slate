Ext.define('Slate.model.person.Person', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        'Username',
        'FirstName',
        'MiddleName',
        'LastName',
        'Gender',
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
            name: 'Advisor',
            allowNull: true,
            sortType: function(v) {
                return v ? v.LastName : '_';
            }
        },
        {
            name: 'AdvisorID',
            allowNull: true
        },
        {
            name: 'GraduationYear',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'FullName',
            depends: ['FirstName', 'LastName'],
            convert: function(v, r) {
                return r.get('FirstName') + ' ' + r.get('LastName');
            }
        },
        {
            name: 'SortName',
            depends: ['FirstName', 'LastName'],
            convert: function(v, r) {
                return r.get('LastName') + ', ' + r.get('FirstName');
            }
        }
    ],

    validators: {
        FirstName: 'presence',
        LastName: 'presence'
    },

    proxy: {
        type: 'slate-records',
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
        } else if (firstName) {
            return firstName;
        } else if (email) {
            return email;
        }

        return 'Person #'+id;
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
        }

        return 'people//?id='+me.get('ID');
    }
});

