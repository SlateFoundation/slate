Ext.define('SlateAdmin.store.progress.interims.Authors', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    model: 'Slate.model.person.Person',

    config: {
        pageSize: false,
        proxy: {
            type: 'slate-records',
            url: '/progress/section-interim-reports/*authors'
        },
        sorters: [
            {
                property: 'LastName',
                direction: 'ASC'
            },
            {
                property: 'FirstName',
                direction: 'ASC'
            }
        ]
    }
});