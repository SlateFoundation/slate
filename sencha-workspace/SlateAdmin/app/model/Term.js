/*jslint browser: true, undef: true *//*global Ext*/
//TODO: perhaps this should be in model/course directory with Course, Department, and Section?
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
            type: "string",
            allowNull: true
        },
        {
            name: "Handle",
            type: "string",
            allowNull: true
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
            allowNull: true
        },
        {
            name: "EndDate",
            type: "date",
            dateFormat: "Y-m-d",
            allowNull: true
        },
        {
            name: "ParentID",
            type: "int",
            allowNull: true
        },
        {
            name: "Left",
            type: "int",
            allowNull: true
        },
        {
            name: "Right",
            type: "int",
            allowNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/terms'
    }
});
