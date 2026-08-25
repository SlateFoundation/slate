/**
 * The Email controller manages the emailing functionality
 * for Section Interim Reports within the Student Progress section.
 */
Ext.define('SlateAdmin.controller.progress.interims.Email', {
    extend: 'SlateAdmin.controller.progress.AbstractEmailController',


    // controller config
    moduleRoute: 'progress/interims/email',
    reportsApiPath: '/progress/section-interim-reports',
    emailsStoreId: 'progress.interims.Emails',

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
        loadEmailsBtn: 'progress-interims-email-container button[action=load-emails]',
        resetOptionsBtn: 'progress-interims-email-container button[action=reset-options]',
        emailsGrid: 'progress-interims-email-grid',
        emailsTotalCmp: 'progress-interims-email-grid #emailsTotal',
        sendEmailsBtn: 'progress-interims-email-grid button[action=send-emails]',
        emailPreviewCmp: 'progress-interims-email-container #emailPreview'
    },

    routes: {
        'progress/interims/email': 'showContainer'
    },

    listen: {
        store: {
            '#progress.interims.Emails': {
                load: 'onEmailsStoreLoad'
            }
        }
    }
});
