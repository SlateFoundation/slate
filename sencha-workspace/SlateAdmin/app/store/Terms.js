/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.Terms', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.Term',
    proxy: {
        type: 'slaterecords',
        url: '/terms',
        startParam: false,
        limitParam: false,
        extraParams: {
            includeCurrent: true
        }
    },
    sorters: [{
        property: 'Right',
        direction: 'DESC'
    }],

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