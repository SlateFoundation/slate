Ext.define('Slate.store.people.Advisors', {
    extend: 'Slate.store.people.People',


    config: {
        proxy: {
            type: 'slate-people',
            url: '/people/*advisors'
        }
    }
});