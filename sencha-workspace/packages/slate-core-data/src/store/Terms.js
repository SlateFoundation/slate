Ext.define('Slate.store.Terms', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.Term',

    config: {
        currentTerm: null,
        currentMasterTerm: null,
        reportingTerm: null,

        pageSize: 0,
        proxy: {
            type: 'slate-terms',
            extraParams: {
                includeCurrent: true
            }
        },
        sorters: [{
            property: 'masterStartDate',
            direction: 'DESC'
        },{
            property: 'Left',
            direction: 'ASC'
        }]
    },


    // config handlers
    applyCurrentTerm: function (value) {
        return (typeof value == 'number' ? this.getById(value) : value) || null;
    },

    updateCurrentTerm: function (newValue, oldValue) {
        this.fireEvent('currenttermchange', this, newValue, oldValue);
    },

    applyCurrentMasterTerm: function (value) {
        return (typeof value == 'number' ? this.getById(value) : value) || null;
    },

    updateCurrentMasterTerm: function (newValue, oldValue) {
        this.fireEvent('currentmastertermchange', this, newValue, oldValue);
    },

    applyReportingTerm:  function (value) {
        return (typeof value == 'number' ? this.getById(value) : value) || null;
    },

    updateReportingTerm: function (newValue, oldValue) {
        this.fireEvent('currentreportingchange', this, newValue, oldValue);
    },

    onProxyLoad: function(operation) {
        var me = this;

        if (!me.destroyed && operation.wasSuccessful()) {
            const records = operation.getRecords();
            const rawData = operation.getProxy().getReader().rawData;

            // build an initial map of records by id
            const byId = {};

            for (const record of records) {
                byId[record.getId()] = record;
            }


            // load current/reporting term metadata directly from response
            if (rawData) {
                if ('currentTerm' in rawData) {
                    me.setCurrentTerm(byId[rawData.currentTerm]);
                }

                if ('currentMasterTerm' in rawData) {
                    me.setCurrentMasterTerm(byId[rawData.currentMasterTerm]);
                }

                if ('reportingTerm' in rawData) {
                    me.setReportingTerm(byId[rawData.reportingTerm]);
                }
            }


            // decorate dataset with hierarchy metadata
            for (const record of records) {
                let parentId = record.get('ParentID');
                let parentRecord = null;

                while (parentId) {
                    parentRecord = byId[parentId];

                    if (!parentRecord) {
                        break;
                    }

                    parentId = parentRecord.get('ParentID');
                }

                record.set('masterStartDate', (parentRecord||record).get('StartDate'), { commit: true });
            }
        }

        me.callParent(arguments);
    }
});
