Ext.define('Slate.model.person.Relationship', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.people.Relationships',
        'Slate.validator.CallbackValidator',
        'Slate.model.person.Person',
        'Ext.data.validator.Presence',
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
            defaultValue: 'Emergence\\People\\Relationship'
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

        // Relationship fields
        {
            name: 'PersonID',
            type: 'int'
        },
        {
            name: 'RelatedPersonID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Label',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },

        // dynamic fields
        {
            name: 'RelatedPerson',
            allowNull: true,
            defaultValue: null,
            convert: function(v) {
                if (v && Ext.isObject(v) && !v.isModel) {
                    v = new Slate.model.person.Person(v);
                }

                return v;
            },
            serialize: function(v) {
                return v && v.isModel ? v.getChanges() : null;
            }
        },
        {
            name: 'InverseRelationship',
            allowNull: true,
            defaultValue: null
        }
    ],

    proxy: 'slate-relationships',

    validators: {
        Class: 'presence',
        PersonID: 'presence',
        Label: 'presence',
        RelatedPerson: {
            type: 'callback',
            message: 'Select an existing person or provide a first and last name to add a new person',
            callback: function(val) {
                return val && val.isModel && val.isValid();
            }
        },
        InverseRelationship: {
            type: 'callback',
            message: 'Enter an inverse label for this relationship',
            callback: function(val) {
                return val && val.Label;
            }
        }
    }
});
