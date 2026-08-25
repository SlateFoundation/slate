/**
 * @abstract
 * Shared implementation for the progress report emailing sections — the
 * interims and terms controllers are identical apart from their module
 * routes, stores, and API endpoints, declared via the contract below.
 *
 * ## Responsibilities
 * - Enable emailing progress section reports.
 */
Ext.define('SlateAdmin.controller.progress.AbstractEmailController', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global Slate:false */
        'Slate.API'
    ],


    // subclass contract
    moduleRoute: null, // e.g. 'progress/interims/email'
    reportsApiPath: null, // e.g. '/progress/section-interim-reports'
    emailsStoreId: null, // e.g. 'progress.interims.Emails'


    control: {
        loadEmailsBtn: {
            click: 'onLoadEmailsClick'
        },
        resetOptionsBtn: {
            click: 'onResetOptionsClick'
        },
        emailsGrid: {
            select: 'onEmailsGridSelect'
        },
        sendEmailsBtn: {
            click: 'onSendEmailsClick'
        }
    },


    // route handlers
    showContainer: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        navPanel.setActiveLink(me.moduleRoute);
        navPanel.expand();

        me.application.getController('Viewport').loadCard(me.getContainer());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onLoadEmailsClick: function() {
        var me = this;

        me.resetPreview();

        me.getEmailsStore().load({
            params: me.buildEmailsParams()
        });
    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    },

    onEmailsStoreLoad: function(emailsStore) {
        var me = this,
            count = emailsStore.getCount();

        if (count) {
            if (emailsStore.getProxy().getReader().rawData.author) {
                me.getEmailsTotalCmp().setText('Auther filter for preview only, cannot send partial reports');
                me.getSendEmailsBtn().disable();
            } else {
                me.getEmailsTotalCmp().setText(count + ' report email' + (count == 1 ? '' : 's') + ' ready');
                me.getSendEmailsBtn().enable();
            }
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
        emailPreviewCmp.iframeEl.dom.src = Slate.API.buildUrl(me.reportsApiPath + '/*email-preview?reports=' + reportIds.join(','));
    },

    onSendEmailsClick: function(sendEmailsBtn) {
        var me = this,
            emailsStore = me.getEmailsStore(),
            emailsCount = emailsStore.getCount(),
            i = 0, email,
            emails = [], recipients;

        sendEmailsBtn.disable();

        for (; i < emailsCount; i++) {
            email = emailsStore.getAt(i);
            recipients = email.get('recipients').filter(
                recipient =>
                    recipient.status == 'proposed'
                    || recipient.status == 'failed'
                    || recipient.status == 'bounced'
            );

            if (!recipients.length) {
                continue;
            }

            emails.push({
                reports: email.get('reports'),
                recipients: Ext.Array.pluck(recipients, 'id')
            });
        }

        if (emails.length == 0) {
            Ext.Msg.alert('No emails sent', 'No new emails need to be sent');
            return;
        }

        Ext.Msg.confirm('Send report emails', 'Are you sure you want to send out '+emails.length+' emails now?', function(btn) {
            if (btn != 'yes') {
                sendEmailsBtn.enable();
                return;
            }

            Slate.API.request({
                method: 'POST',
                url: me.reportsApiPath + '/*emails',
                timeout: 300000,
                jsonData: emails,
                callback: function(options, success, response) {
                    var data = response.data || {};

                    sendEmailsBtn.enable();

                    if (!success || !data.success) {
                        Ext.Msg.alert('Failed to send emails', 'A problem occurred while sending emails, all or some may not have been sent');
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
    getEmailsStore: function() {
        return Ext.getStore(this.emailsStoreId);
    },

    buildEmailsParams: function() {
        var formValues = this.getOptionsForm().getValues(),
            params = {},
            paramKey, paramValue;

        for (paramKey in formValues) {
            if (
                formValues.hasOwnProperty(paramKey)
                && (paramValue = formValues[paramKey])
                && (paramKey != 'status' || paramValue != 'any')
            ) {
                if (paramKey == 'group') {
                    paramKey = 'students';
                    paramValue = 'group>'+paramValue;
                }
                params[paramKey] = paramValue;
            }
        }

        return params;
    },

    resetEmails: function() {
        var me = this,
            emailsTotalCmp = me.getEmailsTotalCmp();

        emailsTotalCmp.setText(emailsTotalCmp.getInitialConfig('text'));

        me.getEmailsStore().removeAll();

        me.getSendEmailsBtn().disable();
    },

    resetPreview: function() {
        var emailPreviewCmp = this.getEmailPreviewCmp();

        emailPreviewCmp.iframeEl.dom.src = '';
    }
});
