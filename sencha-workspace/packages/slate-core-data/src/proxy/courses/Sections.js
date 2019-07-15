Ext.define('Slate.proxy.courses.Sections', {
    extend: 'Slate.proxy.Records',
    alias: 'proxy.slate-courses-sections',


    config: {
        url: '/sections',
        include: ['Term']
    }
});