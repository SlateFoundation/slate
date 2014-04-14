/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.people.Profile', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.details.Profile'
    ],

    refs: [{
        ref: 'personDetailTabs',
        selector: 'people-manager #detailTabs'
    },{
        ref: 'profilePanel',
        selector: 'people-details-profile',
        autoCreate: true,
        
        xtype: 'people-details-profile'
    },{
        ref: 'profileForm',
        selector: 'people-details-profile form'
    },{
        ref: 'studentNumberField',
        selector: 'people-details-profile field[name=StudentNumber]'
    },{
        ref: 'accountLevelField',
        selector: 'people-details-profile field[name=AccountLevel]'
    },{
        ref: 'groupsField',
        selector: 'people-details-profile field[name=groupIDs]'
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
            'people-details-profile button[action=save]':{
                click: me.onSaveProfileClick
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

        me.getStudentNumberField().setVisible(personClass == 'Slate\\Student');
        me.getAccountLevelField().setVisible(personClass != 'Person');
        
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

    onSaveProfileClick: function() {
        var me = this,
            profileForm = me.getProfileForm(),
            form = profileForm.getForm(),
            person = form.getRecord();

        profileForm.setLoading('Saving&hellip;');
        
        form.updateRecord(person);

        person.save({
            success: function(record) {
                // manually commit entire saved record until EXTJSIV-11442 is fixed
                // see: http://www.sencha.com/forum/showthread.php?273093-Dirty-red-mark-of-grid-cell-not-removed-after-record.save
                record.commit();

                record.fireEvent('afterCommit', record);

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
    }
});