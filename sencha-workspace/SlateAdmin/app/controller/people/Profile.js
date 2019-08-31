/**
 * people.Profile controller handles events for the people.details.Profile
 */
Ext.define('SlateAdmin.controller.people.Profile', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.DomHelper',
        'Ext.window.MessageBox',
        'Ext.data.StoreManager',

        /* global Slate */
        'Slate.API'
    ],


    // controller config
    views: [
        'people.Manager',
        'people.details.Profile'
    ],

    stores: [
        'people.Classes',
        'people.Groups@Slate.store',
        'people.Advisors@Slate.store',
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
        classField: 'people-details-profile field[name=Class]',
        usernameField: 'people-details-profile field[name=Username]',
        temporaryPasswordFieldCt: 'people-details-profile fieldcontainer#temporaryPasswordFieldCt',
        temporaryPasswordField: 'people-details-profile field[name=TemporaryPassword]',
        resetTemporaryPasswordBtn: 'people-details-profile button[action=reset-temporary-password]',
        masqueradeBtnCt: 'people-details-profile fieldcontainer#masqueradeBtnCt',
        masqueradeBtn: 'people-details-profile button[action=masquerade]',
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
        'people-details-profile field[name=Class]': {
            change: 'onClassChange'
        },
        cancelBtn: {
            click: 'onCancelButtonClick'
        },
        saveBtn: {
            click: 'onSaveButtonClick'
        },
        resetTemporaryPasswordBtn: {
            click: 'onResetTemporaryPasswordClick'
        },
        masqueradeBtn: {
            click: 'onMasqueradeClick'
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
     * @param {Slate.model.person.Person} person The person record.
     * @return {void}
     */
    onPersonLoaded: function(profilePanel, person) {
        var me = this,
            profileForm = me.getProfileForm(),
            siteEnv = window.SiteEnvironment || {},
            siteUserAccountLevel = siteEnv.user && siteEnv.user.AccountLevel,
            siteUserIsAdmin = siteUserAccountLevel == 'Administrator' || siteUserAccountLevel == 'Developer';

        profilePanel.setLoading('Loading&hellip;');
        Ext.StoreMgr.requireLoaded([
            'people.Classes',
            'people.Groups',
            'people.AccountLevels',
            'people.Advisors'
        ], function() {
            var temporaryPasswordFieldCt = me.getTemporaryPasswordFieldCt();
            Ext.suspendLayouts();

            profileForm.loadRecord(person);
            temporaryPasswordFieldCt.setVisible(temporaryPasswordFieldCt.isVisible() && siteUserIsAdmin);
            me.getUsernameField().setReadOnly(!siteUserIsAdmin);
            me.getMasqueradeBtnCt().setVisible(siteUserIsAdmin && person.get('Username'));
            me.syncButtons();
            profilePanel.setLoading(false);

            Ext.resumeLayouts(true);
        });
    },

    onClassChange: function(combo, personClass) {
        var profileFormCmp = this.getProfileForm(),
            profileForm = profileFormCmp.getForm(),

            fields = profileForm.getRecord().getFields(),
            fieldsLength = fields.length,
            fieldIndex = 0,
            field, fieldClasses, formField, formFieldContainer,

            fieldsets = profileFormCmp.query('fieldset'),
            fieldsetsLength = fieldsets.length,
            fieldsetIndex = 0,
            fieldset;

        for (; fieldIndex < fieldsLength; fieldIndex++) {
            field = fields[fieldIndex];
            fieldClasses = field.classes;

            if (!fieldClasses) {
                continue;
            }

            formField = profileForm.findField(field.name);

            if (formField) {
                formField.setVisible(Ext.Array.contains(fieldClasses, personClass));
                formFieldContainer = formField.up('fieldcontainer');

                if (formFieldContainer) {
                    formFieldContainer.setVisible(formFieldContainer.query('field{isVisible()}').length);
                }
            }
        }

        for (; fieldsetIndex < fieldsetsLength; fieldsetIndex++) {
            fieldset = fieldsets[fieldsetIndex];
            fieldset.setVisible(fieldset.query('> field{isVisible()}, > fieldcontainer{isVisible()}').length);
        }
    },

    /**
     * Event Handler. Discards changes and resets form to last loaded state when cancel button is clicked.
     * @return {void}
     */
    onCancelButtonClick: function() {
        var me = this,
            manager = me.getManager(),
            person = manager.getSelectedPerson();

        if (person.phantom) {
            manager.setSelectedPerson(null);
        } else {
            me.getProfileForm().getForm().reset();
        }
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
            manager = me.getManager(),
            wasPhantom = person.phantom;

        profileForm.setLoading('Saving&hellip;');

        form.updateRecord(person);

        person.save({
            success: function(record) {
                manager.syncDetailHeader();
                profileForm.loadRecord(record);
                profileForm.setLoading(false);

                if (wasPhantom) {
                    me.redirectTo(person.toUrl()+'/profile');
                }
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

    onMasqueradeClick: function(masqueradeBtn) {
        var person = this.getProfileForm().getRecord();

        Ext.Msg.confirm(
            'Log in as user '+person.get('Username')+'?',
            [
                '<p>',
                '   Masquerading will switch you into this user&rsquo;s account,',
                '   as if you had logged in as them.',
                '</p>',
                '<p>',
                '   You will be logged out of your administrator session, and will need',
                '   to manually log out of the user&rsquo;s account and back into',
                '   your administrator account when you are ready to return. Consider',
                '   doing this from an incognito browser window if you would like to',
                '   maintain an administrative session in your normal browser window',
                '   while masquerading as other users.',
                '</p>',
                '<p>',
                '   Clicking <strong>Yes</strong> will immediately leave this screen and take you',
                '   to the website logged in as <strong>'+person.get('FullName')+'</strong>',
                '</p>'
            ].join(''),
            function(btnId) {
                if (btnId != 'yes') {
                    return;
                }

                masqueradeBtn.disable();

                Ext.DomHelper.append(Ext.getBody(), {
                    tag: 'form',
                    action: Slate.API.buildUrl('/masquerade'),
                    method: 'POST',
                    style: {
                        display: 'none'
                    },
                    cn: [{
                        tag: 'input',
                        type: 'hidden',
                        name: 'username',
                        value: person.get('Username')
                    }]
                }).submit();
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
            person = profileForm.getRecord(),
            valid = profileForm.isValid(),
            dirty = profileForm.isDirty();

        me.getCancelBtn().setDisabled(!dirty && (!person || !person.phantom));
        me.getSaveBtn().setDisabled(!dirty || !valid);
    }
});
