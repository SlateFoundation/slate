/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.person.ProgressReport', {
    extend: 'Ext.data.Model',


    // model config
    idProperty: 'ID',

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
    },

    getUrl: function() {
        switch (this.get('Class')) {
            case 'Slate\\Progress\\SectionTermReport':
                return '/progress/section-term-reports/'+this.getId();
            case 'Slate\\Progress\\SectionInterimReport':
                return '/progress/section-interim-reports/'+this.getId();
            case 'Slate\\Progress\\Note':
                return '/notes/' + this.getId();
            default:
                return null;
        }
    }
});