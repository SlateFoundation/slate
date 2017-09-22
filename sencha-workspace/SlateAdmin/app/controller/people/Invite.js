/**
 * people.Invite controller
 */
Ext.define('SlateAdmin.controller.people.Invite', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Ext.data.StoreManager',

        /* global Slate */
        'Slate.API'
    ],


    // controller config
    views: [
        'people.invitations.Window'
    ],

    stores: [
        'people.Invitations',
        'people.Classes'
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


    // event handlers
    onOpenClick: function(sendBtn) {
        var me = this,
            peopleGrid = me.getPeopleGrid(),
            peopleSelModel = peopleGrid.getSelectionModel(),
            selectedPeople = peopleSelModel.getSelection(),
            window = me.getInvitationsWindow(),
            store = me.getPeopleInvitationsStore();

        sendBtn.disable();

        // select all people if none selected
        if (!selectedPeople.length) {
            selectedPeople = peopleGrid.getStore().getRange();
        }

        store.removeAll();

        Slate.API.request({
            method: 'GET',
            url: '/invitations',
            headers: {
                Accept: 'application/json'
            },
            params: {
                status: 'pending',
                recipient: Ext.Array.map(selectedPeople, function(person) {
                    return person.getId();
                }).join(',')
            },
            success: function(response) {
                var invitationsData = (Ext.decode(response.responseText)||{}).data || [],
                    invitationsByRecipient = Ext.Array.toValueMap(invitationsData, 'RecipientID');

                me.withClassesLoaded(function(classesStore) {
                    var defaultUserClass = classesStore.getAt(classesStore.findExact('userDefault', true));

                    store.add(Ext.Array.map(selectedPeople, function(person) {
                        var personClass = classesStore.getById(person.get('Class')),
                            invitation = invitationsByRecipient[person.getId()];

                        if (!Ext.Array.contains(personClass.get('interfaces'), 'Emergence\\People\\IUser')) {
                            personClass = defaultUserClass;
                        }

                        return {
                            Person: person,
                            selected: Boolean(person.get('PrimaryEmail')),
                            UserClass: personClass.getId(),
                            Invited: invitation ? Ext.Date.parse(invitation.Created, 'timestamp') : null
                        };
                    }));

                    sendBtn.enable();
                    window.show();
                });
            }
        });


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
            headers: {
                Accept: 'application/json'
            },
            params: {
                personId: invitation.get('Person').getId(),
                message: invitationsWindow.down('textareafield').getValue()
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

    withClassesLoaded: function (callback, scope) {
        var classesStore = this.getPeopleClassesStore();

        if (classesStore.isLoaded()) {
            Ext.callback(callback, scope, [classesStore]);
            return;
        }

        classesStore.load({
            callback: function() {
                Ext.callback(callback, scope, [classesStore]);
            }
        });
    }
});
