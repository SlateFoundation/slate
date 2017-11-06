Ext.define('SlateAdmin.controller.courses.Participants', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'SlateAdmin.API'
    ],


    // controller config
    views: [
        'courses.sections.details.Participants'
    ],

    models: [
        'Person@Slate.model.person',
        'course.SectionParticipant'
    ],

    stores: [
        'courses.SectionParticipants',
        'courses.SectionParticipantRoles',
        'courses.SectionCohorts'
    ],

    refs: {
        participantsPanel: {
            selector: 'courses-sections-details-participants',
            autoCreate: true,

            xtype: 'courses-sections-details-participants'
        },
        participantsGrid: 'courses-sections-details-participants grid',
        roleField: 'courses-sections-details-participants #roleField',
        personField: 'courses-sections-details-participants #personField'
    },


    control: {
        'courses-sections-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'courses-sections-details-participants': {
            sectionloaded: 'onSectionLoaded'
        },
        'courses-sections-details-participants field': {
            specialkey: 'onFieldSpecialKey'
        },
        'courses-sections-details-participants button[action=add-participant]': {
            click: 'onAddParticipantClick'
        },
        'courses-sections-details-participants grid': {
            openclick: 'onOpenParticipantClick',
            deleteclick: 'onDeleteParticipantClick'
        }
    },

    listen: {
        store: {
            '#courses.SectionParticipants': {
                write: 'onParticipantsStoreWrite'
            }
        }
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getParticipantsPanel());
    },

    onSectionLoaded: function(participantsPanel, section) {
        var me = this,
            participantsStore = me.getParticipantsGrid().getStore(),
            cohortsStore = me.getCoursesSectionCohortsStore();

        // configure proxy and load store
        participantsStore.getProxy().setExtraParam('course_section', section.get('Code'))
        participantsStore.load();

        // configure proxy url for cohort field
        cohortsStore.setSection(section);
    },

    onFieldSpecialKey: function(field, ev) {
        if (ev.getKey() == ev.ENTER && Ext.isNumber(this.getPersonField().getValue())) {
            this.doAddParticipant();
        }
    },

    onAddParticipantClick: function() {
        this.doAddParticipant();
    },

    onOpenParticipantClick: function(grid, participant) {
        this.redirectTo(this.getPersonModel().create(participant.get('Person')));
    },

    onDeleteParticipantClick: function(grid, participant) {
        var me = this,
            participantsPanel = me.getParticipantsPanel(),
            section = participantsPanel.getLoadedSection();

        Ext.Msg.confirm(
            'Remove participant',
            Ext.String.format(
                'Are you sure you want to remove the <strong>{0}</strong> role for <strong>{1} {2}</strong> from <strong>{3}</strong>?',
                participant.get('Role'),
                participant.get('PersonFirstName'),
                participant.get('PersonLastName'),
                section.get('Code')
            ),
            function(btn) {
                if (btn != 'yes') {
                    return;
                }

                participantsPanel.setLoading('Removing participant&hellip;');
                participant.erase({
                    success: function() {
                        participantsPanel.setLoading(false);
                    },
                    failure: function(record, operation) {
                        participantsPanel.setLoading(false);
                        Ext.Msg.alert('Participant not removed', operation.getError() || 'This person could not be removed as a participant.');
                    }
                });
            }
        );
    },

    onParticipantsStoreWrite: function(participantsStore, operation) {
        var cohortsStore = this.getCoursesSectionCohortsStore(),
            cohortsSectionId = cohortsStore.getSection().getId(),
            participants = operation.getRecords(),
            participantsLength = participants.length,
            participantIndex = 0,
            participant, cohort;

        for (; participantIndex < participantsLength; participantIndex++) {
            participant = participants[participantIndex];
            cohort = participant.get('Cohort');

            if (participant.get('CourseSectionID') == cohortsSectionId && cohortsStore.findExact('Cohort', cohort) == -1) {
                cohortsStore.add({
                    Cohort: cohort
                });
            }
        }
    },


    // internal methods
    doAddParticipant: function() {
        var me = this,
            participantsPanel = me.getParticipantsPanel(),
            section = participantsPanel.getLoadedSection(),
            personField = me.getPersonField(),
            participant = this.getCourseSectionParticipantModel().create({
                CourseSectionID: section.getId(),
                PersonID: personField.getValue(),
                Role: me.getRoleField().getValue()
            });

        if (!participant.get('PersonID')) {
            personField.focus();
            return;
        }

        participantsPanel.setLoading('Adding participant&hellip;');

        participant.save({
            success: function() {
                me.getCoursesSectionParticipantsStore().add(participant);
                participantsPanel.setLoading(false);
            },
            failure: function(record, operation) {
                var message = operation.getError();

                if (message.indexOf('Duplicate value') === 0) {
                    message = 'This person is already a participant in this section, remove them first to add with a new role';
                }

                participantsPanel.setLoading(false);
                Ext.Msg.alert('Participant not added', message || 'This person could not be added as a participant.');
            }
        });
    }
});