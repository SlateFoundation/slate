Ext.define('SlateAdmin.controller.progress.interims.Email', {
    extend: 'Ext.app.Controller',


    views: [
        'progress.interims.email.Container'
    ],

    stores: [
        'Terms',
        'Advisors@Slate.store.people',
        'progress.interims.Authors',
        'progress.interims.People',
        'progress.interims.Emails'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        container: {
            selector: 'progress-interims-email-container',
            autoCreate: true,

            xtype: 'progress-interims-email-container'
        },
        optionsForm: 'progress-interims-email-container form#optionsForm',
        filtersFieldset: 'progress-interims-email-container fieldset#filtersFieldset'
    },

    routes: {
        'progress/interims/email': 'showContainer'
    },

    control: {
        container: {
            activate: 'onContainerActivate'
        },
        'progress-interims-email-container button[action=reset-options]': {
            click: 'onResetOptionsClick'
        }
    },

    listen: {
    },


    // route handlers
    showContainer: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/interims/email');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getContainer());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onContainerActivate: function () {

    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    }


    // controller methods
});