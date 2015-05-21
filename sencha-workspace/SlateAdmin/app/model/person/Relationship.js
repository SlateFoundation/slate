/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.Relationship', {
    extend: 'Ext.data.Model',
    requires: [
//        'Jarvus.ext.override.data.CallbackValidation',
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int",
            useNull: true
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
            useNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            useNull: true
        },
        {
            name: "PersonID",
            type: "int"
        },
        {
            name: "RelatedPersonID",
            type: "int",
            useNull: true
        },
        {
            name: "Label",
            type: "string",
            useNull: true
        },
        {
            name: "Notes",
            type: "string",
            useNull: true
        },
        {
            name: 'RelatedPerson',
            useNull: true
        },
        {
            name: 'InverseRelationship',
            useNull: true
        }
    ],

    validations: [
        {
            type: 'presence',
            field: 'Class'
        },
        {
            type: 'presence',
            field: 'PersonID'
        },
        {
            type: 'callback',
            field: 'RelatedPerson',
            message: 'Select an existing person or provide a first and last name to add a new person',
            validate: function(value, config) {
                return value.ID || (value.FirstName && value.LastName);
            }
        },
        {
            type: 'presence',
            field: 'Label'
        },
        {
            type: 'callback',
            field: 'InverseRelationship',
            message: 'Enter an inverse label for this relationship',
            validate: function(value, config) {
                return value && value.Label;
            }
        },
    ],
    
    associations: [{
        type: 'hasOne',
        model: 'SlateAdmin.model.person.Relationship',
        associationKey: 'InverseRelationship',
        getterName: 'getInverseRelationship'
    }],

    proxy: {
        type: 'slaterecords',
        url: '/relationships',
        include: ['RelatedPerson', 'InverseRelationship']
    }
});
