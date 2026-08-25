/**
 * Duplicate-candidate queue, defaulting to open pairs. Status is a proxy
 * extraParam (see MergeQueue controller) rather than a remote filter --
 * matches the ?status= query param the candidates endpoint expects.
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
            type: 'slate-records',
            url: '/people/merge/candidates',
            extraParams: {
                status: 'open'
            }
        }
    }
});
