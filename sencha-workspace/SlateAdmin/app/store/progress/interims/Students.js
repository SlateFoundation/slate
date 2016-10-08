Ext.define('SlateAdmin.store.progress.interims.Students', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    model: 'SlateAdmin.model.person.Person',
    config: {
        pageSize: false,
        proxy: {
            type: 'slaterecords'
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