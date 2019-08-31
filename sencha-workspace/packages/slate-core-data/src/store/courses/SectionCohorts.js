Ext.define('Slate.store.courses.SectionCohorts', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.Records'
    ],


    config: {
        section: null,

        pageSize: 0,
        remoteSort: false,

        fields: [
            'Cohort'
        ],

        sorters: [
            {
                property: 'Cohort',
                direction: 'ASC'
            }
        ],

        proxy: {
            type: 'slate-records',
            reader: {
                type: 'json',
                transform: function(response) {
                    return Ext.Array.map(response.data, function(cohort) {
                        return {
                            'Cohort': cohort
                        }
                    });
                }
            }
        }
    },


    // config handlers
    updateSection: function(sectionCode) {
        this.getProxy().setUrl('/sections/'+sectionCode+'/cohorts');
        this.dirty = true;
    },


    // member methods
    loadIfDirty: function() {
        if (!this.dirty || this.getSection() === null) {
            return;
        }

        this.dirty = false;
        this.load();
    },

    unload: function() {
        this.loadCount = 0;
        this.removeAll();
    }
});