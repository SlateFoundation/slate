/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.course.Course', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
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
            defaultValue: "Slate\\Courses\\Course"
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
            name: "RevisionID",
            type: "int",
            useNull: true
        },
        {
            name: "Title",
            type: "string"
        },
        {
            name: "Handle",
            type: "string"
        },
        {
            name: "Code",
            type: "string"
        },
        {
            name: "Status",
            type: "string",
            defaultValue: "Live"
        },
        {
            name: "Description",
            type: "string",
            useNull: true
        },
        {
            name: "Prerequisites",
            type: "string",
            useNull: true
        },
        {
            name: "DepartmentID",
            type: "int",
            useNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/courses'
    }
});