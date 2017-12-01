Ext.define('Slate.store.courses.Sections', {
    extend: 'Ext.data.Store',
    alternateClassName: [
        'Slate.store.CourseSections'
    ],


    model: 'Slate.model.course.Section',

    config: {
        pageSize: 0,
        remoteSort: true,
        sorters: [
            {
                property: 'CurrentTerm',
                direction: 'ASC'
            },
            {
                property: 'Code',
                direction: 'ASC'
            }
        ]
    }
});