Ext.define('SlateAdmin.store.progress.terms.Emails', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    model: 'SlateAdmin.model.progress.Email',
    config: {
        pageSize: false,
        proxy: {
            type: 'slate-records',
            url: '/progress/section-term-reports/*emails'
        },
        sorters: [
            {
                property: 'sortName',
                direction: 'ASC'
            }
        ]
    }
});