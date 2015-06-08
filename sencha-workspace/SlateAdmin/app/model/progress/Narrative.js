/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.Narrative', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.BelongsToAssociation',
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
            read: '/narratives/json/reports/mystudents',
            create: '/narratives/json/reports/save',
            update: '/narratives/json/reports/save',
            destroy: '/narratives/json/reports/destroy'
        }
    }
});
