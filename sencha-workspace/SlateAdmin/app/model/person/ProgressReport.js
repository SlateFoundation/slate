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
            defaultValue: 'ProgressNote'
        }, {
            name: 'Type',
            convert: function (v, r) {
                switch (r.get('Class'))
                {
                    case 'InterimReport':
                        return 'Interim';
                    case 'NarrativeReport':
                        return 'Narrative';
                    case 'ProgressNote':
                        return 'Note';
                    case 'Standards':
                        return 'Standards';
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
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data'
        },
        api: {
            read: '/progress/json'

        }
    }
});
