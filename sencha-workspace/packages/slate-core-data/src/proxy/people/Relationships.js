Ext.define('Slate.proxy.people.Relationships', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.slate-relationships',


    config: {
        url: '/relationships',
        include: ['RelatedPerson', 'InverseRelationship']
    }
});