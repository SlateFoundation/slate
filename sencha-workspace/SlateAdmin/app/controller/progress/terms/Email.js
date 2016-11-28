Ext.define('SlateAdmin.controller.progress.terms.Email', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global Slate:false */
        'Slate.API'
    ],


    views: [
        'progress.terms.email.Container'
    ],

    stores: [
        'Terms',
        'Advisors@Slate.store.people',
        'progress.terms.Authors',
        'progress.terms.Emails'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        container: {
            selector: 'progress-terms-email-container',
            autoCreate: true,

            xtype: 'progress-terms-email-container'
        },
        optionsForm: 'progress-terms-email-container form#optionsForm',
        emailsGrid: 'progress-terms-email-grid',
        emailsTotalCmp: 'progress-terms-email-grid #emailsTotal',
        sendEmailsBtn: 'progress-terms-email-grid button[action=send-emails]',
        emailPreviewCmp: 'progress-terms-email-container #emailPreview'
    },

    routes: {
        'progress/terms/email': 'showContainer'
    },

    control: {
        'progress-terms-email-container button[action=load-emails]': {
            click: 'onLoadEmailsClick'
        },
        'progress-terms-email-container button[action=reset-options]': {
            click: 'onResetOptionsClick'
        },
        emailsGrid: {
            select: 'onEmailsGridSelect'
        },
        sendEmailsBtn: {
            click: 'onSendEmailsClick'
        }
    },

    listen: {
        store: {
            '#progress.terms.Emails': {
                load: 'onEmailsStoreLoad'
            }
        }
    },


    // route handlers
    showContainer: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/terms/email');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getContainer());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onLoadEmailsClick: function() {
        var me = this,
            emailsStore = me.getProgressTermsEmailsStore();

        me.resetPreview();

        emailsStore.load({
            params: me.getOptionsForm().getValues()
        });
    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    },

    onEmailsStoreLoad: function(emailsStore) {
        var me = this,
            count = emailsStore.getCount();

        if (count) {
            me.getEmailsTotalCmp().setText(count + ' report email' + (count == 1 ? '' : 's') + ' ready');
            me.getSendEmailsBtn().enable();
        } else {
            me.resetEmails();
            me.resetPreview();
        }
    },

    onEmailsGridSelect: function(emailsGrid, emailRecord) {
        var me = this,
            emailPreviewCmp = me.getEmailPreviewCmp(),
            reportIds = emailRecord.get('reports');

        if (!reportIds.length) {
            me.resetPreview();
            return;
        }

        emailPreviewCmp.setLoading('Downloading reports&hellip;');
        emailPreviewCmp.iframeEl.dom.src = Slate.API.buildUrl('/progress/terms/reports/*email-preview?reports='+reportIds.join(','));
    },

    onSendEmailsClick: function(sendEmailsBtn) {
        var me = this,
            emailsStore = me.getProgressTermsEmailsStore(),
            emailsCount = emailsStore.getCount(),
            i = 0, email,
            emails = [];

        sendEmailsBtn.disable();

        for (; i < emailsCount; i++) {
            email = emailsStore.getAt(i);

            emails.push({
                reports: email.get('reports'),
                recipients: Ext.Array.pluck(email.get('recipients'), 'id')
            });
        }

        Ext.Msg.confirm('Send report emails', 'Are you sure you want to send out '+emails.length+' emails now?', function(btn) {
            if (btn != 'yes') {
                sendEmailsBtn.enable();
                return;
            }

            Slate.API.request({
                method: 'POST',
                url: '/progress/terms/reports/*emails',
                jsonData: emails,
                callback: function(options, success, response) {
                    var data = response.data || {};

                    sendEmailsBtn.enable();

                    if (!success || !data.success) {
                        Ext.Msg.confirm('Failed to send emails', 'A problem occurred while sending emails, all or some may not have been sent');
                        return;
                    }

                    Ext.Msg.alert(
                        'Emails sent',
                        Ext.String.format(
                            '{0} email{1} sent to {2} recipient{3}',
                            data.emailsCount,
                            data.emailsCount == 1 ? '' : 's',
                            data.recipientsCount,
                            data.recipientsCount == 1 ? '' : 's'
                        ),
                        function() {
                            me.resetEmails();
                            me.resetPreview();
                        }
                    );
                }
            });
        });
    },


    // controller methods
    resetEmails: function() {
        var me = this,
            emailsTotalCmp = me.getEmailsTotalCmp();

        emailsTotalCmp.setText(emailsTotalCmp.getInitialConfig('text'));

        me.getProgressTermsEmailsStore().removeAll();

        me.getSendEmailsBtn().disable();
    },

    resetPreview: function() {
        var emailPreviewCmp = this.getEmailPreviewCmp();

        emailPreviewCmp.iframeEl.dom.src = '';
    }
});