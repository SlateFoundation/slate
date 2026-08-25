/**
 * The Print controller manages the printing functionality
 * for Section Interim Reports within the Student Progress section.
 */
Ext.define('SlateAdmin.controller.progress.interims.Print', {
    extend: 'SlateAdmin.controller.progress.AbstractPrintController',


    // controller config
    moduleRoute: 'progress/interims/print',
    reportsApiPath: '/progress/section-interim-reports',
    csvFileName: 'interim-reports.csv',

    views: [
        'progress.interims.print.Container'
    ],

    stores: [
        'Terms@Slate.store',
        'people.Advisors@Slate.store',
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
        loadPrintoutBtn: 'progress-interims-print-container button[action=load-printout]',
        printPrintoutBtn: 'progress-interims-print-container button[action=print-printout]',
        openTabBtn: 'progress-interims-print-container button[action=open-tab]',
        saveCsvBtn: 'progress-interims-print-container button[action=save-csv]',
        resetOptionsBtn: 'progress-interims-print-container button[action=reset-options]',
        printoutCmp: 'progress-interims-print-container slate-printpreview'
    },

    routes: {
        'progress/interims/print': 'showContainer'
    }
});
