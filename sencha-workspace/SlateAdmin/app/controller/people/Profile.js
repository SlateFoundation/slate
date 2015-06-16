/*jslint browser: true, undef: true *//*global Ext*/
/**
 * people.Profile controller
 */
Ext.define('SlateAdmin.controller.people.Profile', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.Manager',
        'people.details.Profile'
    ],

    refs: [{
        ref: 'profilePanel',
        selector: 'people-details-profile',
        autoCreate: true,

        xtype: 'people-details-profile'
    },{
        ref: 'profileForm',
        selector: 'people-details-profile form'
    },{
        ref: 'cancelBtn',
        selector: 'people-details-profile button[action=cancel]'
    },{
        ref: 'saveBtn',
        selector: 'people-details-profile button[action=save]'
    },{
        ref: 'studentNumberField',
        selector: 'people-details-profile field[name=StudentNumber]'
    },{
        ref: 'accountLevelField',
        selector: 'people-details-profile field[name=AccountLevel]'
    },{
        ref: 'groupsField',
        selector: 'people-details-profile field[name=groupIDs]'
    },{
        ref: 'manager',
        selector: 'people-manager'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'people-manager #detailTabs': {
                beforerender: me.onBeforeTabsRender
            },
            'people-details-profile': {
                personloaded: me.onPersonLoaded
            },
            'people-details-profile form': {
                dirtychange: me.syncButtons,
                validitychange: me.syncButtons
            },
            'people-details-profile button[action=cancel]': {
                click: me.onCancelButtonClick
            },
            'people-details-profile button[action=save]': {
                click: me.onSaveButtonClick
            }
        });
    },


    // event handlers
    onBeforeTabsRender: function(detailTabs) {
        detailTabs.add(this.getProfilePanel());
    },

    onPersonLoaded: function(profilePanel, person) {
        var me = this,
            personClass = person.get('Class'),
            profileForm = me.getProfileForm(),
            groupsField = me.getGroupsField(),
            groupsStore = groupsField.getStore();

        me.getStudentNumberField().setVisible(personClass == 'Slate\\People\\Student');
        me.getAccountLevelField().setVisible(personClass != 'Emergence\\People\\Person');

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

    onCancelButtonClick: function() {
        this.getProfileForm().getForm().reset();
    },

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


    // internal methods
    syncButtons: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            valid = profileForm.isValid(),
            dirty = profileForm.isDirty();

        me.getCancelBtn().setDisabled(!dirty);
        me.getSaveBtn().setDisabled(!dirty || !valid);
    }
});
