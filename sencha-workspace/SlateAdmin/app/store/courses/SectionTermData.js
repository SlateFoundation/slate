Ext.define('SlateAdmin.store.courses.SectionTermData', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.SectionTermData',

    proxy: {
        type: 'slaterecords',
        url: '/section-data'
    }
});