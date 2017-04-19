/*jslint browser: true, undef: true *//*global Ext*/
/**
 * people.Invite controller
 */
Ext.define('SlateAdmin.controller.people.Invite', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'people.invitations.Window'
    ],

    stores: [
        'people.Invitations'
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
    onOpenClick: function() {
        var me = this,
            peopleGrid = me.getPeopleGrid(),
            peopleSelModel = peopleGrid.getSelectionModel(),
            selectedPeople = peopleSelModel.getSelection(),
            window = me.getInvitationsWindow(),
            store = me.getPeopleInvitationsStore();

        // TODO: add all results if no selection made
        store.removeAll();
        store.add(Ext.Array.map(selectedPeople, function(person) {
            return { Person: person, selected: Boolean(person.get('PrimaryEmail')) };
        }));

        window.show();
    },

    onGridCheckHeaderClick: function(headerCt) {
        var store = this.getPeopleInvitationsStore();

        store.suspendEvents(true);
        store.each(function(invitation) {
            invitation.set('selected', !invitation.get('selected'));
            invitation.commit();
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


        for (; i < selectedPeopleLength; i++) {
            people.push(selectedPeople[i].get('Person').getId());
        }

        if (!people.length) {
            Ext.Msg.alert('No people selected', 'To send invitations, check the box to the left of at least one person');
            return;
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
            params: {
                'people[]': people,
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
    }
});
