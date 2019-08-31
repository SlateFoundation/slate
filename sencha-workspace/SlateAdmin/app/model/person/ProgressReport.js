Ext.define('SlateAdmin.model.person.ProgressReport', {
    extend: 'Ext.data.Model',


    // model config
    fields: [
        'AuthorUsername',
        'Subject',
        {
            name: 'ID',
            type: 'integer',
            allowNull: true,
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
        url: '/progress'
    },

    getUrl: function() {
        switch (this.get('Class')) {
            case 'Slate\\Progress\\SectionTermReport':
                return '/progress/section-term-reports/'+this.get('ID');
            case 'Slate\\Progress\\SectionInterimReport':
                return '/progress/section-interim-reports/'+this.get('ID');
            case 'Slate\\Progress\\Note':
                return '/notes/' + this.get('ID');
            default:
                return null;
        }
    }
});