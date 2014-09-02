/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.course.SectionParticipant', {
    extend: 'Ext.data.Model',
    requires: [
        'Emergence.ext.proxy.Records'
    ],


    // model config
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
            defaultValue: "Slate\\Courses\\SectionParticipant"
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
            name: "CourseSectionID",
            type: "int"
        },
        {
            name: "PersonID",
            type: "int"
        },
        {
            name: "Role",
            type: "string"
        },
        {
            name: "StartDate",
            type: "date",
            dateFormat: "timestamp",
            useNull: true
        },
        {
            name: "EndDate",
            type: "date",
            dateFormat: "timestamp",
            useNull: true
        },
        {
            name: "Person"
        },
        {
            name: 'PersonFirstName',
            mapping: 'Person.FirstName'
        },
        {
            name: 'PersonLastName',
            mapping: 'Person.LastName'
        },
        {
            name: 'PersonUsername',
            mapping: 'Person.Username'
        },
        {
            name: 'PersonID',
            mapping: 'Person.ID'
        }
    ]
});