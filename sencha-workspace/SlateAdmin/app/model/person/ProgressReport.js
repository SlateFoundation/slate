/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.person.ProgressReport', {
    extend: 'Ext.data.Model',
    fields: [
        'AuthorUsername',
        'Subject',
        {
            name: 'ID',
            type: 'integer',
            useNull: true,
            defaultValue: null
        }, {
            name: 'Class',
            defaultValue: 'Slate\\Progress\\Note'
        }, {
            name: 'ClassLabel',
            depends: [
                'Class'
            ],
            calculate: function (data) {
                switch (data.Class) {
                    case 'Slate\\Progress\\SectionInterimReport':
                        return 'Interim Report';
                    case 'Slate\\Progress\\SectionTermReport':
                    case 'NarrativeReport':
                        return 'Term Report';
                    case 'Slate\\Progress\\Note':
                        return 'Progress Note';
                    default:
                        return 'Unknown Report'
                }
            }
        }, {
            name: 'Date',
            type: 'date',
            dateFormat: 'Y-m-d H:i:s'
        }, {
            name: 'StudentID',
            type: 'integer'
        }, {
            name: 'CourseSectionID',
            type: 'integer'
        }, {
            name: 'TermID',
            type: 'integer'
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/progress',
        extraParams: {
            summarize: true
        }
    }
});
