/**
 * Duplicate-candidate queue, defaulting to open pairs. Status is a proxy
 * extraParam (see MergeQueue controller) rather than a remote filter --
 * matches the ?status= query param the candidates endpoint expects. The
 * url/include contract lives on the proxy class (one file per endpoint,
 * referenced by alias) -- this store only adds its own extraParams.
 */
Ext.define('SlateAdmin.store.mergequeue.Candidates', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.mergequeue.Candidate'
    ],

    model: 'SlateAdmin.model.mergequeue.Candidate',
    config: {
        pageSize: 0,
        proxy: {
            type: 'mergequeue-candidates',
            extraParams: {
                status: 'open'
            }
        }
    }
});
