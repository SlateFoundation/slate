Ext.define('SlateAdmin.store.courses.SectionCohorts', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.API'
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
            type: 'slateapi',
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

    updateSection: function(section) {
        this.getProxy().setUrl('/sections/' + section.get('Code') + '/cohorts');
        this.load();
    }
});