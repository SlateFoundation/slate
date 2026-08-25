/**
 * Follow-up action queue, defaulting to pending actions. Status is a proxy
 * extraParam (see mergequeue.Actions controller) matching the endpoint's
 * ?status= query param.
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
            type: 'slate-records',
            url: '/people/merge/actions',
            extraParams: {
                status: 'pending'
            }
        }
    }
});
