/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.model.TermReport', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Records',
        'Ext.data.identifier.Negative'
    ],


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
            defaultValue: 'Slate\\Progress\\Narratives\\Report'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true,
            persist: false
        },
        {
            name: 'Modified',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'StudentID',
            type: 'int'
        },
        {
            name: 'CourseSectionID',
            type: 'int'
        },
        {
            name: 'TermID',
            type: 'int'
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'draft'
        },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'StudentFirstName',
            type: 'string',
            allowNull: true,
            mapping: 'Student.FirstName'
        },
        {
            name: 'StudentLastName',
            type: 'string',
            allowNull: true,
            mapping: 'Student.LastName'
        },

        // local-only fileds
        {
            name: 'student',
            persist: false
        },
        {
            name: 'section',
            persist: false
        },
        {
            name: 'term',
            persist: false
        }
    ],

    proxy: {
        type: 'slate-records',
        url: '/progress/narratives/reports',
        limitParam: null,
        startParam: null
    }
});
