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
                property: 'PersonLastName',
                direction: 'ASC'
            },
            {
                property: 'PersonFirstName',
                direction: 'ASC'
            }
        ]
    },


    // model lifecycle
    constructor: function() {
        this.callParent(arguments);
        this.dirty = true;
    },

    loadRecords: function() {
        var me = this,
            personIdMap = {},
            count, index = 0, participant;

        me.callParent(arguments);

        if (!me.getSection()) {
            me.peopleMap = null;
            return;
        }

        for (count = me.getCount(); index < count; index++) {
            participant = me.getAt(index);
            personIdMap[participant.get('PersonID')] = participant;
        }

        me.personIdMap = personIdMap;
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
    },

    getByPersonId: function(personId) {
        var personIdMap = this.personIdMap;

        if (!personIdMap) {
            Ext.Logger.warn('getByPersonId is only available when filtering by section');
            return null;
        }

        return personIdMap[personId] || null;
    }
});