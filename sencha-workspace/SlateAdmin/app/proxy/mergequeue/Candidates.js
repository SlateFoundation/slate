Ext.define('SlateAdmin.proxy.mergequeue.Candidates', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.mergequeue-candidates',

    config: {
        url: '/people/merge/candidates',
        include: ['Person1', 'Person2']
    }
});
