Ext.define('SlateAdmin.store.Terms', {
    extend: 'Ext.data.Store',


    model: 'SlateAdmin.model.Term',
    config: {
        pageSize: 0,

        proxy: {
            type: 'slaterecords',
            url: '/terms',
            extraParams: {
                includeCurrent: true
            }
        },

        sorters: [{
            property: 'Right',
            direction: 'DESC'
        }]
    },


    getCurrentTerm: function() {
        var me = this,
            rawData = me.getProxy().getReader().rawData,
            termId = rawData && rawData.currentTerm;

        return (termId && me.getById(termId)) || null;
    },

    getReportingTerm: function() {
        var me = this,
            rawData = me.getProxy().getReader().rawData,
            termId = rawData && rawData.reportingTerm;

        return (termId && me.getById(termId)) || null;
    }
});