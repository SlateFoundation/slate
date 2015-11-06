/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Slate.model.Section', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Records',
        'Ext.data.identifier.Negative'
    ],


    // model config
    idProperty: 'ID',
    identifier: 'negative',

    fields: [
        {
            name: 'ID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Class',
            type: 'string',
            defaultValue: 'Slate\\Courses\\Section'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'CourseID',
            type: 'int'
        },
        {
            name: 'Title',
            type: 'string'
        },
        {
            name: 'Code',
            type: 'string'
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'Live'
        },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'StudentsCapacity',
            type: 'int',
            allowNull: true
        },
        {
            name: 'TermID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'ScheduleID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'LocationID',
            type: 'int',
            allowNull: true
        }
    ],

    proxy: {
        type: 'slate-records',
        url: '/sections'
    }
});