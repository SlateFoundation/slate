/**
 * Follow-up action queue, defaulting to pending actions. Status is a proxy
 * extraParam (see mergequeue.Actions controller) matching the endpoint's
 * ?status= query param. The url/include contract lives on the proxy class
 * (one file per endpoint, referenced by alias) -- this store only adds its
 * own extraParams.
 */
Ext.define('SlateAdmin.store.mergequeue.FollowUpActions', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.mergequeue.FollowUpAction'
    ],

    model: 'SlateAdmin.model.mergequeue.FollowUpAction',
    config: {
        pageSize: 0,
        proxy: {
            type: 'mergequeue-followupactions',
            extraParams: {
                status: 'pending'
            }
        }
    }
});
