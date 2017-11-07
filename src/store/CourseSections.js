Ext.define('Slate.store.CourseSections', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.CourseSection',

    config: {
        pageSize: 0,
        remoteSort: true,
        sorters: [{
            property: 'CurrentTerm',
            direction: 'ASC'
        },{
            property: 'Code',
            direction: 'ASC'
        }]
    }
});