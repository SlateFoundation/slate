/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.Relationship', {
    extend: 'Ext.data.Model',
    requires: [
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
            type: "int"
        },
        {
            name: "Relationship",
            type: "string",
            useNull: true
        },
        {
            name: "Notes",
            type: "string",
            useNull: true
        },
        {
            name: 'RelatedPerson'
        },
        {
            name: 'InverseRelationship'
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
            type: 'presence',
            field: 'Relationship'
        }
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
