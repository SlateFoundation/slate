Ext.define('SlateAdmin.controller.progress.interims.Print', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global Slate:false */
        'Slate.API'
    ],


    views: [
        'progress.interims.print.Container'
    ],

    stores: [
        'Terms',
        'Advisors@Slate.store.people',
        'progress.interims.Authors'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        container: {
            selector: 'progress-interims-print-container',
            autoCreate: true,

            xtype: 'progress-interims-print-container'
        },
        optionsForm: 'progress-interims-print-container form#optionsForm',
        // emailsGrid: 'progress-interims-email-grid',
        // emailsTotalCmp: 'progress-interims-email-grid #emailsTotal',
        // sendEmailsBtn: 'progress-interims-email-grid button[action=send-emails]',
        printoutCmp: 'progress-interims-print-container #printout'
    },

    routes: {
        'progress/interims/print': 'showContainer'
    },

    control: {
        'progress-interims-print-container button[action=load-printout]': {
            click: 'onLoadPrintoutClick'
        },
        'progress-interims-print-container button[action=print-printout]': {
            click: 'onPrintPrintoutClick'
        },
        'progress-interims-print-container button[action=reset-options]': {
            click: 'onResetOptionsClick'
        },
        // emailsGrid: {
        //     select: 'onEmailsGridSelect'
        // },
        // sendEmailsBtn: {
        //     click: 'onSendEmailsClick'
        // }
    },

    listen: {
        // store: {
        //     '#progress.interims.Emails': {
        //         load: 'onEmailsStoreLoad'
        //     }
        // }
    },


    // route handlers
    showContainer: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/interims/print');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getContainer());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onLoadPrintoutClick: function() {
        this.loadPrintout();
    },

    onPrintPrintoutClick: function() {
        this.loadPrintout(function(previewCmp) {
            previewCmp.iframeEl.dom.contentWindow.print();
        });
    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    },


    // controller methods
    loadPrintout: function(callback) {
        var printoutCmp = this.getPrintoutCmp(),
            filters = this.getOptionsForm().getValues();

        filters.status = 'published';

        if (callback) {
            printoutCmp.on('previewload', callback, null, { single: true });
        }

        printoutCmp.setLoading('Loading printout&hellip;');
        printoutCmp.iframeEl.dom.src = Slate.API.buildUrl('/progress/section-interim-reports?'+Ext.Object.toQueryString(filters));
    }
});