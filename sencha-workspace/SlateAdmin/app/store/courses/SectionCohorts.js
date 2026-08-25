Ext.define('SlateAdmin.store.courses.SectionCohorts', {
    extend: 'Ext.data.Store',
    requires: [
        'Slate.proxy.API'
    ],


    config: {
        section: null,

        fields: [
            'Cohort'
        ],

        sorters: [{
            property: 'Cohort',
            direction: 'ASC'
        }],

        proxy: {
            type: 'slate-api',
            reader: {
                type: 'json',
                transform: function(response) {
                    return Ext.Array.map(response.data, function(cohort) {
                        return {
                            'Cohort': cohort
                        };
                    });
                }
            }
        }
    },

    updateSection: function(section) {
        this.getProxy().setUrl('/sections/' + section.get('Code') + '/cohorts');
        this.load();
    }
});