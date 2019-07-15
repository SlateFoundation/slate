Ext.define('Slate.proxy.people.GlobalRecipients', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.slate-globalrecipients',


    config: {
        url: '/global-recipients',
        include: ['Person']
    }
});