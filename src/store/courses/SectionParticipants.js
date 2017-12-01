Ext.define('Slate.store.courses.SectionParticipants', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.course.SectionParticipant',

    config: {
        section: null,
        cohort: null,
        role: null,

        pageSize: 0,
        remoteSort: false,
        sorters: [
            {
                property: 'LastName',
                direction: 'ASC'
            },
            {
                property: 'FirstName',
                direction: 'ASC'
            }
        ]
    },


    constructor: function() {
        this.callParent(arguments);
        this.dirty = true;
    },


    // config handlers
    updateSection: function(section) {
        this.getProxy().setExtraParam('course_section', section || null);
        this.dirty = true;
    },

    updateCohort: function(cohort) {
        this.getProxy().setExtraParam('cohort', cohort || null);
        this.dirty = true;
    },

    updateRole: function(role) {
        this.getProxy().setExtraParam('role', role || null);
        this.dirty = true;
    },


    // member methods
    loadIfDirty: function() {
        if (!this.dirty) {
            return;
        }

        this.dirty = false;
        this.load();
    }
});