Ext.define('SlateAdmin.store.progress.terms.Sections', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    model: 'Slate.model.CourseSection',
    config: {
        pageSize: false,
        proxy: {
            type: 'slate-records',
            url: '/sections'
        }
    }
});
