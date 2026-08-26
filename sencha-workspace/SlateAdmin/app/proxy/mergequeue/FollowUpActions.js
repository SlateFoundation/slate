Ext.define('SlateAdmin.proxy.mergequeue.FollowUpActions', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.mergequeue-followupactions',

    config: {
        url: '/people/merge/actions',
        // nested include so the actions grid's Linked Merge column can
        // render person names, not just the audit ID
        include: ['MergeAudit.SourcePerson', 'MergeAudit.TargetPerson']
    }
});
