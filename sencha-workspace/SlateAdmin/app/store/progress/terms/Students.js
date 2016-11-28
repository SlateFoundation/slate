Ext.define('SlateAdmin.store.progress.terms.Students', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    model: 'Slate.model.person.Person',

    config: {
        pageSize: false,
        proxy: 'slate-records',
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