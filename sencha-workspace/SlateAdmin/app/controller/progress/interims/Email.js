Ext.define('SlateAdmin.controller.progress.interims.Email', {
    extend: 'Ext.app.Controller',
    requires: [
        'Slate.API'
    ],


    views: [
        'progress.interims.email.Container'
    ],

    stores: [
        'Terms',
        'Advisors@Slate.store.people',
        'progress.interims.Authors',
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
        filtersFieldset: 'progress-interims-email-container fieldset#filtersFieldset',
        emailsGrid: 'progress-interims-email-grid',
        emailPreviewCmp: 'progress-interims-email-container #emailPreview'
    },

    routes: {
        'progress/interims/email': 'showContainer'
    },

    control: {
        container: {
            activate: 'onContainerActivate'
        },
        'progress-interims-email-container button[action=load-emails]': {
            click: 'onLoadEmailsClick'
        },
        'progress-interims-email-container button[action=reset-options]': {
            click: 'onResetOptionsClick'
        },
        emailsGrid: {
            select: 'onEmailsGridSelect'
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

    onLoadEmailsClick: function() {
        var me = this,
            container = me.getContainer(),
            emailsStore = me.getProgressInterimsEmailsStore();

        container.setLoading(true);

        emailsStore.load({
            params: me.getOptionsForm().getValues(),
            callback: function() {
                container.setLoading(false);
            }
        });
    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    },

    onEmailsGridSelect: function(emailsGrid, emailRecord) {
        var me = this,
            emailPreviewCmp = me.getEmailPreviewCmp(),
            reportIds = emailRecord.get('reports');

        if (!reportIds.length) {
            emailPreviewCmp.iframeEl.dom.src = '';
            emailPreviewCmp.disable();
            return;
        }

        emailPreviewCmp.enable();
        emailPreviewCmp.setLoading('Downloading reports&hellip;');
        emailPreviewCmp.iframeEl.dom.src = Slate.API.buildUrl('/progress/section-interim-reports/*email-preview?reports='+reportIds.join(','));
    }


    // controller methods
});