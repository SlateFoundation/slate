Ext.define('Slate.store.people.Students', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Person',
    config: {
        pageSize: 0,
        remoteSort: false,
        sorters: [{
            property: 'SortName',
            direction: 'ASC'
        }],
        proxy: {
            type: 'slate-people',
            url: '/people/*students',
            summary: true
        }
    },
});