Ext.define('SlateAdmin.proxy.mergequeue.FollowUpActions', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.mergequeue-followupactions',

    config: {
        url: '/people/merge/actions',
        include: ['MergeAudit']
    }
});
