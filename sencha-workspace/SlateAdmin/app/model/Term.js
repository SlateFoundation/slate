/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Term', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int"
        },
        {
            name: "Class",
            type: "string",
            defaultValue: "Term"
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
            name: "StartDate",
            type: "date",
            dateFormat: "Y-m-d",
            useNull: true
        },
        {
            name: "EndDate",
            type: "date",
            dateFormat: "Y-m-d",
            useNull: true
        },
        {
            name: "ParentID",
            type: "int",
            useNull: true
        },
        {
            name: "Left",
            type: "int",
            useNull: true
        },
        {
            name: "Right",
            type: "int",
            useNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/terms'
    }
});