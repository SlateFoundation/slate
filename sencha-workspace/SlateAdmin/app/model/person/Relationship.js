/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.Relationship', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.validator.Presence',
        'SlateAdmin.validator.CallbackValidator', // TODO: move this to a jarvus package eventually
        'SlateAdmin.proxy.Records',

        /* globals Slate */
        'Slate.model.person.Person'
    ],

    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int",
            allowNull: true
        },
        {
            name: "Class",
            type: "string",
            defaultValue: "Emergence\\People\\Relationship"
        },
        {
            name: "Created",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            allowNull: true
        },
        {
            name: "PersonID",
            type: "int"
        },
        {
            name: "RelatedPersonID",
            type: "int",
            allowNull: true
        },
        {
            name: "Label",
            type: "string",
            allowNull: true
        },
        {
            name: "Notes",
            type: "string",
            allowNull: true
        },
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
    },

    proxy: {
        type: 'slaterecords',
        url: '/relationships',
        include: ['RelatedPerson', 'InverseRelationship']
    }
});
