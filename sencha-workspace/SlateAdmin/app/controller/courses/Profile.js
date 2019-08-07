Ext.define('SlateAdmin.controller.courses.Profile', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'courses.sections.details.Profile'
    ],

    stores: [
        'Terms@Slate.store',
        'Locations@Slate.store',
        'courses.Schedules'
    ],

    refs: {
        profilePanel: {
            selector: 'courses-sections-details-profile',
            autoCreate: true,

            xtype: 'courses-sections-details-profile'
        },
        profileForm: 'courses-sections-details-profile form',
        cancelBtn: 'courses-sections-details-profile button[action=cancel]',
        saveBtn: 'courses-sections-details-profile button[action=save]',
        courseField: 'courses-sections-details-profile field[name=CourseID]',
        codeField: 'courses-sections-details-profile field[name=Code]',
        titleField: 'courses-sections-details-profile field[name=Title]'
    },

    control: {
        'courses-sections-manager': {
            selectedsectionchange: 'onSelectedSectionChange'
        },
        'courses-sections-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'courses-sections-details-profile': {
            sectionloaded: 'onSectionLoaded'
        },
        'courses-sections-details-profile form': {
            dirtychange: 'syncButtons',
            validitychange: 'syncButtons'
        },
        'courses-sections-details-profile button[action=cancel]': {
            click: 'onCancelButtonClick'
        },
        'courses-sections-details-profile button[action=save]': {
            click: 'onSaveButtonClick'
        },
        'courses-sections-details-profile combobox[name=CourseID]': {
            select: 'onCourseSelect'
        }
    },


    // event handlers
    onSelectedSectionChange: function(manager, section) {
        var me = this;

        // switch to the profile tab and focus first field if this is a phantom
        if (section && section.phantom) {
            manager.detailTabs.setActiveTab(me.getProfilePanel());

            Ext.defer(function() {
                me.getProfileForm().down('field[readOnly=false][disabled=false]').focus();
            }, 100);
        }
    },

    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getProfilePanel());
    },

    onSectionLoaded: function(profilePanel, section) {
        var me = this;

        me.getCodeField().setDisabled(!section.phantom);

        profilePanel.setLoading('Loading lists&hellip;');
        Ext.StoreMgr.requireLoaded(['Terms', 'Locations', 'courses.Schedules'], function() {
            me.getProfileForm().loadRecord(section);
            me.syncEmptyText();
            profilePanel.setLoading(false);
        });
    },

    onCancelButtonClick: function() {
        this.getProfileForm().getForm().reset();
    },

    onSaveButtonClick: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            form = profileForm.getForm(),
            section = form.getRecord();

        profileForm.setLoading('Saving&hellip;');

        form.updateRecord(section);

        section.save({
            success: function(record) {
                profileForm.loadRecord(record);

                profileForm.setLoading(false);
            },
            failure: function(record, operation) {
                var rawData = record.getProxy().getReader().rawData,
                    failed,
                    validationErrors;

                if (rawData && (failed = rawData.failed) && failed[0] && (validationErrors = failed[0].validationErrors)) {
                    Ext.Object.each(validationErrors, function(fieldName, error) {
                        var field = profileForm.getForm().findField(fieldName);

                        if (field) {
                            profileForm.getForm().findField(fieldName).markInvalid(error);
                        }
                    });
                    validationErrors = 'You\'ve tried to make invalid changes, please check the highlighted field(s) for details';
                }

                Ext.Msg.alert('Not saved', validationErrors);
                profileForm.setLoading(false);
            }
        });
    },

    onCourseSelect: function() {
        this.syncEmptyText();
    },


    // internal methods
    syncEmptyText: function() {
        var me = this,
            courseField = me.getCourseField(),
            codeField = me.getCodeField(),
            titleField = me.getTitleField(),
            courseId = courseField.getValue(),
            course = courseId && courseField.findRecordByValue(courseId);

        codeField.setEmptyText(course ? (course.get('Code') + '-000') : 'ABCD-000');
        titleField.setEmptyText(course ? course.get('Title') : 'Algebra 1');
    },

    syncButtons: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            valid = profileForm.isValid(),
            dirty = profileForm.isDirty();

        me.getCancelBtn().setDisabled(!dirty);
        me.getSaveBtn().setDisabled(!dirty || !valid);
    }
});