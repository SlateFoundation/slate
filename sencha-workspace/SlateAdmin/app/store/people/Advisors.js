Ext.define('SlateAdmin.store.people.Advisors', {
    extend: 'Ext.data.Store',

    model: 'Slate.model.person.Person',
    proxy: {
        type: 'slate-records',
        url: '/people/*advisors',
        startParam: false,
        limitParam: false
    }
});
