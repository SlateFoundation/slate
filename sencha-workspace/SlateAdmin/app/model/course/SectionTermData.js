/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.course.SectionTermData', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
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
            defaultValue: 'Slate\\Courses\\SectionTermData'
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
            name: 'RevisionID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Modified',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'ModifierID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'SectionID',
            type: 'int'
        },
        {
            name: 'TermID',
            type: 'int'
        },
        {
            name: 'TermReportNotes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'InterimReportNotes',
            type: 'string',
            allowNull: true
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/section-data'
    }
});