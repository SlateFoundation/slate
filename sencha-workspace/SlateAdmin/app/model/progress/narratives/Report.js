/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.narratives.Report', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',
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
            defaultValue: 'Draft'
        },
        {
            name: 'Updated',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'Grade',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Assessment',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Comments',
            type: 'string',
            allowNull: true
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
        type: 'slaterecords',
        url: '/progress/narratives/reports'
    }
});