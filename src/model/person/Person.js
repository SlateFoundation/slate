Ext.define('Slate.model.person.Person', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.people.People',
        'Ext.data.identifier.Negative',
        'Ext.data.validator.Presence'
    ],


    // model config
    idProperty: 'ID',
    identifier: 'negative',

    fields: [
        // person fields
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            defaultValue: 'Emergence\\People\\Person'
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
        'PrimaryPhoto',
        {
            name: 'PrimaryEmailID',
            type: 'integer',
            allowNull: true
        },
        'PrimaryEmail',
        {
            name: 'PrimaryPhoneID',
            type: 'integer',
            allowNull: true
        },
        'PrimaryPhone',
        {
            name: 'PrimaryPostalID',
            type: 'integer',
            allowNull: true
        },
        'PrimaryPostal',
        {
            name: 'FirstName',
            defaultValue: null
        },
        {
            name: 'LastName',
            defaultValue: null
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
            persist: false,
            depends: ['FirstName', 'LastName'],
            convert: function(v, r) {
                return Ext.Array.clean([
                    r.get('FirstName'),
                    r.get('LastName')
                ]).join(' ');
            }
        },
        {
            name: 'PreferredFullName',
            persist: false,
            depends: ['PreferredName', 'FirstName', 'LastName'],
            convert: function(v, r) {
                return Ext.Array.clean([
                    r.get('PreferredName') || r.get('FirstName'),
                    r.get('LastName')
                ]).join(' ');
            }
        },
        {
            name: 'SortName',
            persist: false,
            depends: ['FirstName', 'LastName'],
            convert: function(v, r) {
                return r.get('LastName') + ', ' + r.get('FirstName');
            }
        },
        {
            name: 'Email',
            depends: ['PrimaryEmail'],
            convert: function(v, r) {
                var pointData = r.get('PrimaryEmail');

                return pointData ? pointData.Data : null;
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
            classes: [
                'Emergence\\People\\User',
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'AccountLevel',
            classes: [
                'Emergence\\People\\User',
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'TemporaryPassword',
            classes: [
                'Emergence\\People\\User',
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null
        },


        // student fields
        {
            name: 'StudentNumber',
            classes: [
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'Advisor',
            classes: [
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null,
            sortType: function(v) {
                return v ? v.LastName : '_';
            }
        },
        {
            name: 'AdvisorID',
            classes: [
                'Slate\\People\\Student'
            ],
            allowNull: true,
            defaultValue: null
        },
        {
            name: 'GraduationYear',
            classes: [
                'Slate\\People\\Student'
            ],
            type: 'integer',
            allowNull: true,
            defaultValue: null
        }
    ],

    validators: {
        FirstName: 'presence',
        LastName: 'presence'
    },

    proxy: 'slate-people',


    // model methods
    getFullName: function() {
        return this.get('FullName');
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

    // TODO: move this to a SlateAdmin override
    toUrl: function() {
        var me = this;

        // TODO: append /profile via route rewriter in controller
        if (me.phantom) {
            return null;
        } else if (me.get('Username')) {
            return 'people/lookup/'+me.get('Username')+'/profile';
        }

        return 'people/lookup/?id='+me.get('ID')+'/profile';
    }
});

