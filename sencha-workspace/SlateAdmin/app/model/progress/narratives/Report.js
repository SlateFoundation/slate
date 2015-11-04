/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.narratives.Report', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
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
            defaultValue: 'Draft'
        },
        // {
        //     name: 'Grade',
        //     type: 'string',
        //     allowNull: true
        // },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Quote',
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
        url: '/progress/narratives/reports',
        limitParam: null,
        startParam: null
    }
});