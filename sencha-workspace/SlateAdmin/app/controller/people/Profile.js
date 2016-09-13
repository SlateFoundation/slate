/*jslint browser: true, undef: true *//*global Ext*/
/**
 * people.Profile controller handles events for the people.details.Profile
 */
Ext.define('SlateAdmin.controller.people.Profile', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Slate.API'
    ],


    // controller config
    views: [
        'people.Manager',
        'people.details.Profile'
    ],

    refs: {
        profilePanel: {
            selector: 'people-details-profile',
            autoCreate: true,

            xtype: 'people-details-profile'
        },
        profileForm: 'people-details-profile form',
        cancelBtn: 'people-details-profile button[action=cancel]',
        saveBtn: 'people-details-profile button[action=save]',
        loginFieldSet: 'people-details-profile fieldset#loginFields',
        usernameField: 'people-details-profile field[name=Username]',
        studentNumberField: 'people-details-profile field[name=StudentNumber]',
        temporaryPasswordFieldCt: 'people-details-profile fieldcontainer#temporaryPasswordFieldCt',
        temporaryPasswordField: 'people-details-profile field[name=TemporaryPassword]',
        resetTemporaryPasswordBtn: 'people-details-profile button[action=reset-temporary-password]',
        groupsField: 'people-details-profile field[name=groupIDs]',
        manager: 'people-manager'
    },

    control: {
        'people-manager #detailTabs': {
            beforerender: 'onBeforeTabsRender'
        },
        'people-details-profile': {
            personloaded: 'onPersonLoaded'
        },
        'people-details-profile form': {
            dirtychange: 'syncButtons',
            validitychange: 'syncButtons'
        },
        cancelBtn: {
            click: 'onCancelButtonClick'
        },
        saveBtn: {
            click: 'onSaveButtonClick'
        },
        resetTemporaryPasswordBtn: {
            click: 'onResetTemporaryPasswordClick'
        }
    },


    // event handlers

    /**
     * Event Handler. Adds the profile panel to the details tab panel
     * @param {Ext.tab.Panel} detailsTabs The details tab panel defined in SlateAdmin.view.people.Manager
     * @return {void}
     */
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getProfilePanel());
    },

    /**
     * Event Handler. Handles personloaded event defined by SlateAdmin.view.people.details.AbstractDetails which fires when
     * the tab is activated or a new person is selected.  This initializes the form for the selected user.
     * @param {SlateAdmin.controller.people.Profile} profilePanel The profile panel.
     * @param {SlateAdmin.model.person.Person} person The person record.
     * @return {void}
     */
    onPersonLoaded: function(profilePanel, person) {
        var me = this,
            personClass = person.get('Class'),
            profileForm = me.getProfileForm(),
            groupsField = me.getGroupsField(),
            groupsStore = groupsField.getStore(),
            siteEnv = window.SiteEnvironment || {},
            siteUserAccountLevel = siteEnv.user && siteEnv.user.AccountLevel,
            siteUserIsAdmin = siteUserAccountLevel == 'Administrator' || siteUserAccountLevel == 'Developer';

        me.getStudentNumberField().setVisible(personClass == 'Slate\\People\\Student');
        me.getLoginFieldSet().setVisible(personClass != 'Emergence\\People\\Person');
        me.getTemporaryPasswordFieldCt().setVisible(siteUserIsAdmin);
        me.getUsernameField().setReadOnly(!siteUserIsAdmin);

        // ensure groups store is loaded before loading record because boxselect doesn't hande re-setting unknown values after local store load
        if (groupsStore.isLoaded()) {
            profileForm.loadRecord(person);
        } else {
            profilePanel.setLoading('Loading groups&hellip;');
            groupsStore.load({
                callback: function() {
                    profileForm.loadRecord(person);
                    profilePanel.setLoading(false);
                }
            });
        }
    },

    /**
     * Event Handler. Discards changes and resets form to last loaded state when cancel button is clicked.
     * @return {void}
     */
    onCancelButtonClick: function() {
        this.getProfileForm().getForm().reset();
    },

    /**
     * Event Handler. Saves changes to user profile.
     * @return {void}
     */
    onSaveButtonClick: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            form = profileForm.getForm(),
            person = form.getRecord(),
            manager = me.getManager();

        profileForm.setLoading('Saving&hellip;');

        form.updateRecord(person);

        person.save({
            success: function(record) {
                // manually commit entire saved record until EXTJSIV-11442 is fixed
                // see: http://www.sencha.com/forum/showthread.php?273093-Dirty-red-mark-of-grid-cell-not-removed-after-record.save
                record.commit();

                manager.syncDetailHeader();

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

    onResetTemporaryPasswordClick: function(resetTemporaryPasswordBtn) {
        var person = this.getProfileForm().getRecord(),
            temporaryPasswordField = this.getTemporaryPasswordField();

        Ext.Msg.confirm(
            'Reissue Temporary Password',
            '<p>Are you sure you want to issue a new temporary password for this user?</p><p>They will no longer be able to log in with their existing password.</p>',
            function(btnId) {
                if (btnId != 'yes') {
                    return;
                }

                resetTemporaryPasswordBtn.disable();

                Slate.API.request({
                    method: 'POST',
                    url: '/people/'+person.get('Username')+'/*temporary-password',
                    callback: function(options, success, response) {
                        var temporaryPassword = success && response.data && response.data.temporaryPassword;

                        resetTemporaryPasswordBtn.enable();

                        if (!temporaryPassword) {
                            Ext.Msg.alert('Failed to reissue', 'A new temporary password could not be reissued at this time');
                            return;
                        }

                        person.set('TemporaryPassword', temporaryPassword, { dirty: false });
                        temporaryPasswordField.setValue(temporaryPassword);
                        temporaryPasswordField.resetOriginalValue();
                    }
                });
            }
        );
    },

    // internal methods

    /**
     * Set the enabled/disabled states of the Save and Cancel buttons based on the dirty and valid properties of the form.
     * @return {void}
     */
    syncButtons: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            valid = profileForm.isValid(),
            dirty = profileForm.isDirty();

        me.getCancelBtn().setDisabled(!dirty);
        me.getSaveBtn().setDisabled(!dirty || !valid);
    }
});
