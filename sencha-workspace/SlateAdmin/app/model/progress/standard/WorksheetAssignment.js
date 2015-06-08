/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.standard.WorksheetAssignment', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.BelongsToAssociation',
        'Ext.data.proxy.Ajax',
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'CourseSectionID',
    fields: [
        'Worksheet',
        'CourseSection',
        'Description',
        {
            name: 'ID',
            type: 'integer'
        }, {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true
        }, {
            name: 'CourseSectionID',
            type: 'integer'
        }, {
            name: 'WorksheetID',
            type: 'integer'
        }, {
            name: 'TermID',
            type: 'integer'
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/standards/assignments',
        include: [
            'CourseSection',
            'Worksheet',
            'Worksheet.TotalPrompts'
        ],
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json',
            writeAllFields: false,
            allowSingle: false,
            root: 'data',
            getRecordData: function (record) {
                return {
                    CourseSectionID: record.get('CourseSectionID'),
                    WorksheetID: record.get('WorksheetID'),
                    ID: record.get('ID'),
                    Description: record.get('Description'),
                    TermID: record.get('TermID')
                };
            }
        }
    }
});
