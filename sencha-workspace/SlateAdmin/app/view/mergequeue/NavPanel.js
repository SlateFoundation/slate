Ext.define('SlateAdmin.view.mergequeue.NavPanel', {
    extend: 'SlateAdmin.view.LinksNavPanel',
    xtype: 'mergequeue-navpanel',

    title: 'Merge Queue',
    data: [
        { href: '#merge-queue', text: 'Duplicate Candidates' },
        { href: '#merge-queue/actions', text: 'Follow-up Actions' }
    ]
});
