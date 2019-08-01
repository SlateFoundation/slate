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
            allowNull: true
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
            allowNull: true
        },
        {
            name: "CreatorID",
            type: "int",
            allowNull: true
        },
        {
            name: "RevisionID",
            type: "int",
            allowNull: true
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
            allowNull: true
        },
        {
            name: "Prerequisites",
            type: "string",
            allowNull: true
        },
        {
            name: "DepartmentID",
            type: "int",
            allowNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/courses'
    }
});