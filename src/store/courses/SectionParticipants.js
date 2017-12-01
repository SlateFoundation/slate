Ext.define('Slate.store.courses.SectionParticipants', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.course.SectionParticipant',

    config: {
        pageSize: 0,
        sorters: [
        ]
    }
});