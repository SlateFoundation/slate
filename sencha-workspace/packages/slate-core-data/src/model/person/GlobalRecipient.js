Ext.define('Slate.model.person.GlobalRecipient', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.people.GlobalRecipients',
        'Ext.data.identifier.Negative',
        'Ext.data.validator.Presence',
        'Ext.data.validator.Bound'
    ],


    // model config
    idProperty: 'ID',
    identifier: 'negative',

    fields: [

        // ActiveRecord fields
        {
            name: 'ID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Class',
            type: 'string',
            defaultValue: 'Emergence\\CRM\\GlobalRecipient'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true,
            persist: false
        },

        // GlobalRecipient fields
        {
            name: 'PersonID',
            type: 'int'
        },
        {
            name: 'Title',
            type: 'string'
        },

        // dynamic fields
        {
            name: 'Person',
            persist: false,
            sortType: function(v) {
                return v ? v.LastName+v.FirstName : '_';
            }
        }
    ],

    proxy: 'slate-globalrecipients',

    validators: [
        {
            field: 'Title',
            type: 'presence',
            message: 'Title is required'
        },
        {
            field: 'PersonID',
            type: 'bound',
            min: 1,
            message: 'PersonID is required'
        }
    ]
});