/**
 * The Email controller manages the emailing functionality
 * for Section Interim Reports within the Student Progress section.
 *
 * ## Responsibilities
 * - Enable emailing progress section interim reports.
 */
Ext.define('SlateAdmin.controller.progress.interims.Email', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global Slate:false */
        'Slate.API'
    ],


    views: [
        'progress.interims.email.Container'
    ],

    stores: [
        'Terms@Slate.store',
        'people.Advisors@Slate.store',
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
        emailsGrid: 'progress-interims-email-grid',
        emailsTotalCmp: 'progress-interims-email-grid #emailsTotal',
        sendEmailsBtn: 'progress-interims-email-grid button[action=send-emails]',
        emailPreviewCmp: 'progress-interims-email-container #emailPreview'
    },

    routes: {
        'progress/interims/email': 'showContainer'
    },

    control: {
        'progress-interims-email-container button[action=load-emails]': {
            click: 'onLoadEmailsClick'
        },
        'progress-interims-email-container button[action=reset-options]': {
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
            '#progress.interims.Emails': {
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
        navPanel.setActiveLink('progress/interims/email');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getContainer());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onLoadEmailsClick: function() {
        var me = this,
            emailsStore = me.getProgressInterimsEmailsStore();

        me.resetPreview();

        emailsStore.load({
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
        emailPreviewCmp.iframeEl.dom.src = Slate.API.buildUrl('/progress/section-interim-reports/*email-preview?reports='+reportIds.join(','));
    },

    onSendEmailsClick: function(sendEmailsBtn) {
        var me = this,
            emailsStore = me.getProgressInterimsEmailsStore(),
            emailsCount = emailsStore.getCount(),
            i = 0, email,
            emails = [], recipients;

        sendEmailsBtn.disable();

        for (; i < emailsCount; i++) {
            email = emailsStore.getAt(i);
            recipients = email.get('recipients').filter(recipient => recipient.status == 'proposed');

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
                url: '/progress/section-interim-reports/*emails',
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

        me.getProgressInterimsEmailsStore().removeAll();

        me.getSendEmailsBtn().disable();
    },

    resetPreview: function() {
        var emailPreviewCmp = this.getEmailPreviewCmp();

        emailPreviewCmp.iframeEl.dom.src = '';
    }
});