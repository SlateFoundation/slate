/**
 * people.Invite controller
 */
Ext.define('SlateAdmin.controller.people.Invite', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global Slate */
        'Slate.API'
    ],


    // controller config
    views: [
        'people.invitations.Window'
    ],

    stores: [
        'people.Invitations',
        'people.UserClasses'
    ],

    refs: {
        peopleGrid: 'people-grid',
        invitationsWindow: {
            selector: 'people-invitationswindow',
            autoCreate: true,

            xtype: 'people-invitationswindow'
        }
    },

    control: {
        'people-grid #sendInvitationsBtn': {
            click: 'onOpenClick'
        },
        'people-invitationspanel grid checkcolumn': {
            headerclick: 'onGridCheckHeaderClick',
            beforecheckchange: 'onGridBeforeCheckChange'
        },
        'people-invitationspanel grid': {
            beforeselect: 'onGridBeforeSelect',
            select: 'onGridSelect'
        },
        'people-invitationspanel button[action=cancel]': {
            click: 'onCancelClick'
        },
        'people-invitationspanel button[action=send]': {
            click: 'onSendClick'
        }
    },

    listen: {
        store: {
            '#people.UserClasses': {
                load: 'onUserClassesLoad'
            }
        }
    },


    // event handlers
    onOpenClick: function() {
        var me = this,
            peopleGrid = me.getPeopleGrid(),
            peopleSelModel = peopleGrid.getSelectionModel(),
            selectedPeople = peopleSelModel.getSelection(),
            window = me.getInvitationsWindow(),
            store = me.getPeopleInvitationsStore();

        // select all people if none selected
        if (!selectedPeople.length) {
            selectedPeople = peopleGrid.getStore().getRange();
        }

        store.removeAll();

        me.withUserClassesLoaded(function(userClassesStore) {
            var userClasses = userClassesStore.collect('value'),
                defaultUserClass = me.getPeopleInvitationsStore().getModel().getField('UserClass').getDefaultValue();

            store.add(Ext.Array.map(selectedPeople, function(person) {
                var personClass = person.get('Class');

                if (!Ext.Array.contains(userClasses, personClass)) {
                    personClass = defaultUserClass;
                }

                return {
                    Person: person,
                    selected: Boolean(person.get('PrimaryEmail')),
                    UserClass: personClass
                };
            }));
        });

        window.show();
    },

    onGridCheckHeaderClick: function(headerCt) {
        var store = this.getPeopleInvitationsStore();

        store.suspendEvents(true);
        store.each(function(invitation) {
            invitation.set('selected', Boolean(!invitation.get('selected') && invitation.get('Email')), { commit: true });
        });
        store.resumeEvents();
    },

    onGridBeforeCheckChange: function(column, rowIndex, checked) {
        if (!this.getPeopleInvitationsStore().getAt(rowIndex).get('Email')) {
            return false;
        }

        return true;
    },

    onGridBeforeSelect: function(rowModel, invitation) {
        if (!invitation.get('Email')) {
            return false;
        }

        return true;
    },

    onGridSelect: function(rowModel, invitation) {
        var me = this,
            invitationsWindow = me.getInvitationsWindow();

        Slate.API.request({
            url: '/invitations/preview',
            params: {
                personId: invitation.get('Person').getId(),
                message: invitationsWindow.down('textareafield').getValue(),
                format: 'json'
            },
            success: function(response) {
                var r = Ext.decode(response.responseText);

                invitationsWindow.down('#emailPreview').update(r);
            }
        });
    },

    onCancelClick: function() {
        this.getInvitationsWindow().hide();
        this.getPeopleInvitationsStore().removeAll();
    },

    onSendClick: function() {
        var me = this,
            invitationsWindow = me.getInvitationsWindow(),
            store = me.getPeopleInvitationsStore(),
            selectedPeople = store.query('selected', true).getRange(),
            selectedPeopleLength = selectedPeople.length,
            people = [],
            i = 0;


        if (!selectedPeopleLength) {
            Ext.Msg.alert('No people selected', 'To send invitations, check the box to the left of at least one person');
            return;
        }

        for (; i < selectedPeopleLength; i++) {
            people.push({
                PersonID: selectedPeople[i].get('Person').getId(),
                UserClass: selectedPeople[i].get('UserClass')
            });
        }

        invitationsWindow.setLoading('Sending invitations&hellip;');

        invitationsWindow.hide();
        invitationsWindow.setLoading(false);

        Slate.API.request({
            url: '/invitations/send',
            headers: {
                Accept: 'application/json'
            },
            method: 'POST',
            jsonData: {
                'people': people,
                message: invitationsWindow.down('textareafield').getValue()
            },
            success: function(response) {
                var r = Ext.decode(response.responseText),
                    sentMessages = r.sent;

                if (r.success) {
                    invitationsWindow.destroy();

                    Ext.Msg.show({
                        title: 'Invitations sent',
                        msg: Ext.String.format(
                            '{0} {1} been mailed successfully',
                            sentMessages,
                            sentMessages == 1 ? 'invitation has' : 'invitations have'
                        ),
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.INFO
                    });
                } else {
                    invitationsWindow.setLoading(false);

                    Ext.Msg.show({
                        title: 'Failed to send invitations',
                        msg: '<strong>No</strong> invitations have been sent: ' + (r.message || 'There was a problem with one or more of the recipients, please report this to your systems administrator.'),
                        buttons: Ext.Msg.OK,
                        icon: Ext.Msg.ERROR
                    });
                }
            }
        });
    },

    withUserClassesLoaded: function (callback, scope) {
        var classesStore = this.getPeopleUserClassesStore();

        if (classesStore.isLoaded()) {
            Ext.callback(callback, scope, [classesStore]);
            return;
        }

        classesStore.load({
            callback: function() {
                Ext.callback(callback, scope, [classesStore]);
            }
        });
    },

    onUserClassesLoad: function(store, records, successful, operation) {
        var response = successful && Ext.decode(operation.getResponse().responseText),
            defaultCls = response && response.default;

        if (defaultCls) {
            this.getPeopleInvitationsStore().getModel().getField('UserClass').defaultValue = defaultCls;
        }
    }
});
