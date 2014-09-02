/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.courses.Profile', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'courses.sections.details.Profile'
    ],

    refs: [{
        ref: 'profilePanel',
        selector: 'courses-sections-details-profile',
        autoCreate: true,
        
        xtype: 'courses-sections-details-profile'
    },{
        ref: 'profileForm',
        selector: 'courses-sections-details-profile form'
    },{
        ref: 'cancelBtn',
        selector: 'courses-sections-details-profile button[action=cancel]'
    },{
        ref: 'saveBtn',
        selector: 'courses-sections-details-profile button[action=save]'
    },{
        ref: 'courseField',
        selector: 'courses-sections-details-profile field[name=CourseID]'
    },{
        ref: 'codeField',
        selector: 'courses-sections-details-profile field[name=Code]'
    },{
        ref: 'titleField',
        selector: 'courses-sections-details-profile field[name=Title]'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'courses-sections-manager': {
                selectedsectionchange: me.onSelectedSectionChange
            },
            'courses-sections-manager #detailTabs': {
                beforerender: me.onBeforeTabsRender
            },
            'courses-sections-details-profile': {
                sectionloaded: me.onSectionLoaded
            },
            'courses-sections-details-profile form': {
                dirtychange: me.syncButtons,
                validitychange: me.syncButtons
            },
            'courses-sections-details-profile button[action=cancel]': {
                click: me.onCancelButtonClick
            },
            'courses-sections-details-profile button[action=save]': {
                click: me.onSaveButtonClick
            },
            'courses-sections-details-profile combobox[name=CourseID]': {
                select: me.onCourseSelect
            }
        });
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
                // manually commit entire saved record until EXTJSIV-11442 is fixed
                // see: http://www.sencha.com/forum/showthread.php?273093-Dirty-red-mark-of-grid-cell-not-removed-after-record.save
                record.commit();

                record.fireEvent('afterCommit', record);
                
                profileForm.loadRecord(record);

                profileForm.setLoading(false);
            },
            failure: function(record, operation) {
                var rawData = record.getProxy().getReader().rawData,
                    errorMessage = 'There was a problem saving your changes, please double-check your changes and try again',
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
        
        codeField.emptyText = course ? (course.get('Code') + '-000') : 'ABCD-000';
        codeField.applyEmptyText();

        titleField.emptyText = course ? course.get('Title') : 'Algebra 1';
        titleField.applyEmptyText();
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