Ext.define('Slate.proxy.people.People', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.slate-people',


    config: {
        url: '/people',
        include: ['groupIDs', 'Advisor', 'PrimaryEmail']
    }
});