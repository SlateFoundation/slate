/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.course.Schedule', {
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
            defaultValue: "Slate\\Courses\\Schedule"
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
            type: "string",
            useNull: true
        },
        {
            name: "Handle",
            type: "string",
            useNull: true
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
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/schedules'
    }
});