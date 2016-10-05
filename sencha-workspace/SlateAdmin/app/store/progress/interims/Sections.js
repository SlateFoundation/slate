Ext.define('SlateAdmin.store.progress.interims.Sections', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    model: 'SlateAdmin.model.course.Section',
    config: {
        pageSize: false,
        proxy: {
            type: 'slaterecords',
            url: '/sections'
        }
    }
});
