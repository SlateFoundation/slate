Ext.define('SlateAdmin.proxy.mergequeue.FollowUpActions', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.mergequeue-followupactions',

    config: {
        url: '/people/merge/actions',
        // hasExecutor is a dynamic field -- serialized only when included;
        // nested MergeAudit person includes let the Linked Merge column
        // render names, not just the audit ID
        include: ['hasExecutor', 'MergeAudit.SourcePerson', 'MergeAudit.TargetPerson']
    }
});
