Ext.define('SlateAdmin.store.people.ProgressReports', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.person.ProgressReport'
    ],

    model: 'SlateAdmin.model.person.ProgressReport',
    proxy: {
        type: 'slaterecords',
        url: '/progress',
        summary: true,
        include: ['Timestamp', 'Author', 'Term']
    }
});