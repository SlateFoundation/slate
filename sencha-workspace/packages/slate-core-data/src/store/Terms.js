Ext.define('Slate.store.Terms', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.Term',

    config: {
        currentTerm: null,
        reportingTerm: null,

        pageSize: 0,
        proxy: {
            type: 'slate-terms',
            extraParams: {
                includeCurrent: true
            }
        },
        sorters: [{
            property: 'Left',
            direction: 'ASC'
        }]
    },


    // config handlers
    applyCurrentTerm: function (value) {
        return typeof value == 'number' ? this.getById(value) : value;
    },

    updateCurrentTerm: function (newValue, oldValue) {
        this.fireEvent('currenttermchange', this, newValue, oldValue);
    },

    applyReportingTerm:  function (value) {
        return typeof value == 'number' ? this.getById(value) : value;
    },

    updateReportingTerm: function (newValue, oldValue) {
        this.fireEvent('currentreportingchange', this, newValue, oldValue);
    },

    // TODO: replace these with onProxyLoad handler that stashes them in evented config?
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
    },

    onProxyLoad: function(operation) {
        var me = this,
            rawData = operation.getProxy().getReader().rawData;

        // let store load first so we can look up IDs
        me.callParent(arguments);

        if (rawData) {
            if ('currentTerm' in rawData) {
                me.setCurrentTerm(rawData.currentTerm);
            }

            if ('reportingTerm' in rawData) {
                me.setReportingTerm(rawData.reportingTerm);
            }
        }
    }
});
