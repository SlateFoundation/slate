/**
 * The Email controller manages the emailing functionality
 * for Section Term Reports within the Student Progress section.
 */
Ext.define('SlateAdmin.controller.progress.terms.Email', {
    extend: 'SlateAdmin.controller.progress.AbstractEmailController',


    // controller config
    moduleRoute: 'progress/terms/email',
    reportsApiPath: '/progress/section-term-reports',
    emailsStoreId: 'progress.terms.Emails',

    views: [
        'progress.terms.email.Container'
    ],

    stores: [
        'Terms@Slate.store',
        'people.Advisors@Slate.store',
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
        loadEmailsBtn: 'progress-terms-email-container button[action=load-emails]',
        resetOptionsBtn: 'progress-terms-email-container button[action=reset-options]',
        emailsGrid: 'progress-terms-email-grid',
        emailsTotalCmp: 'progress-terms-email-grid #emailsTotal',
        sendEmailsBtn: 'progress-terms-email-grid button[action=send-emails]',
        emailPreviewCmp: 'progress-terms-email-container #emailPreview'
    },

    routes: {
        'progress/terms/email': 'showContainer'
    },

    listen: {
        store: {
            '#progress.terms.Emails': {
                load: 'onEmailsStoreLoad'
            }
        }
    }
});
