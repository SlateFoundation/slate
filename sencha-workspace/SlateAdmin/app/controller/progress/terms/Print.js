/**
 * The Print controller manages the printing functionality
 * for Section Term Reports within the Student Progress section.
 */
Ext.define('SlateAdmin.controller.progress.terms.Print', {
    extend: 'SlateAdmin.controller.progress.AbstractPrintController',


    // controller config
    moduleRoute: 'progress/terms/print',
    reportsApiPath: '/progress/section-term-reports',
    csvFileName: 'term-reports.csv',

    views: [
        'progress.terms.print.Container'
    ],

    stores: [
        'Terms@Slate.store',
        'people.Advisors@Slate.store',
        'progress.terms.Authors'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        container: {
            selector: 'progress-terms-print-container',
            autoCreate: true,

            xtype: 'progress-terms-print-container'
        },
        optionsForm: 'progress-terms-print-container form#optionsForm',
        loadPrintoutBtn: 'progress-terms-print-container button[action=load-printout]',
        printPrintoutBtn: 'progress-terms-print-container button[action=print-printout]',
        openTabBtn: 'progress-terms-print-container button[action=open-tab]',
        saveCsvBtn: 'progress-terms-print-container button[action=save-csv]',
        resetOptionsBtn: 'progress-terms-print-container button[action=reset-options]',
        printoutCmp: 'progress-terms-print-container slate-printpreview'
    },

    routes: {
        'progress/terms/print': 'showContainer'
    }
});
