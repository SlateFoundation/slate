Ext.define('Slate.proxy.courses.SectionParticipants', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.slate-courses-participants',


    config: {
        url: '/section-participants',
        include: ['Person']
    }
});