Ext.define('Slate.store.people.Advisors', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    model: 'Slate.model.person.Person',

    config: {
        pageSize: false,
        proxy: {
            type: 'slate-records',
            url: '/people/*advisors'
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