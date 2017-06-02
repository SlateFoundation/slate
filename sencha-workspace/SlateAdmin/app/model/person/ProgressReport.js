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
            name: 'Noun'
        }, {
            name: 'Title'
        }, {
            name: 'Status'
        }, {
            name: 'Timestamp',
            type: 'date',
            dateFormat: 'timestamp'
        }, {
            name: 'Author'
        }, {
            name: 'Student'
        }, {
            name: 'Term'
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/progress',
        summary: true,
        include: ['Timestamp', 'Author', 'Term']
    }
});