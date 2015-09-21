/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.sbg.Narrative', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Ajax',
        'SlateAdmin.proxy.Records'
    ],

    fields: [
        'Class',
        'Student',
        'Section',
        'Status',
        'Grade',
        'Assessment',
        'Comments',
        'Prompts',
        {
            name: 'ID',
            type: 'int'
        }, {
            name: 'StudentID',
            type: 'int'
        }, {
            name: 'CourseSectionID',
            type: 'int'
        }, {
            name: 'TermID',
            type: 'int'
        }, {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp'
        }, {
            name: 'Updated',
            type: 'date',
            dateFormat: 'timestamp'
        }, {
            name: 'CreatorID',
            type: 'int'
        }
    ],
    idProperty: 'ID',
    proxy: {
        type: 'slaterecords',
        api: {
            read: '/sbg/narratives/reports/mystudents',
            create: '/sbg/narratives/reports/save',
            update: '/sbg/narratives/reports/save',
            destroy: '/sbg/narratives/reports/destroy'
        }
    }
});
