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

    refs: [{
        ref: 'peopleGrid',
        selector: 'people-grid'
    },{
        ref: 'invitationsWindow',
        selector: 'people-invitationswindow',
        autoCreate: true,

        xtype: 'people-invitationswindow'
    }],

    control: {
        'people-grid #sendInvitationsBtn': {
            click: 'onOpenClick'
        },
        'people-invitationspanel grid checkcolumn': {
            headerclick: 'onGridCheckHeaderClick'
        },
        'people-invitationspanel grid': {
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
            return { Person: person, selected: true };
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

    onGridSelect: function(rowModel, invitation, rowIndex) {
        var me = this,
            invitationsWindow = me.getInvitationsWindow();

        Ext.Ajax.request({
            url: '/invitations/json/preview',
            params: {
                personId: invitation.get('Person').getId(),
                customMessage: invitationsWindow.down('textareafield').getValue()
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
            store = me.getPeopleInvitationsStore();

        invitationsWindow.setLoading('Sending invitations&hellip;');
//      debugger;
        invitationsWindow.hide();
        invitationsWindow.setLoading(false);
    }
});
