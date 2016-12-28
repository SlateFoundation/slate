Ext.define('SlateAdmin.controller.progress.interims.Print', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Ext.util.CSV',

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
        'progress-interims-print-container button[action=save-csv]': {
            click: 'onSaveCsvClick'
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

    onSaveCsvClick: function() {
        var optionsForm = this.getOptionsForm();

        optionsForm.setLoading('Preparing CSV&hellip;');

        Slate.API.request({
            method: 'GET',
            url: '/progress/section-interim-reports',
            params: Ext.apply({
                include: 'Student.Advisor,Section.Teachers'
            }, this.buildFilters()),
            callback: function(success, operation, response) {
                var downloadLink = document.createElement('a'),
                    rows = response.data.data,
                    rowsCount = rows.length,
                    i = 0, row,
                    csv = [
                        ['Last name', 'First name', 'Student ID', 'Grad. year', 'Advisor', 'Course', 'Section', 'Teacher(s)', 'Grade']
                    ],
                    url;

                for (; i < rowsCount; i++) {
                    row = rows[i];
                    csv.push([
                        row.Student.LastName,
                        row.Student.FirstName,
                        row.Student.StudentNumber,
                        row.Student.GraduationYear,
                        row.Student.Advisor ? row.Student.Advisor.Username : null,
                        row.Section.Title,
                        row.Section.Code,
                        Ext.Array.pluck(row.Section.Teachers, 'Username').join(', '),
                        row.Grade
                    ]);
                }

                downloadLink.href = url = URL.createObjectURL(new Blob([Ext.util.CSV.encode(csv)], { type: 'text/csv' }));
                downloadLink.download = 'interim-reports.csv';
                downloadLink.style.display = 'none';

                document.body.appendChild(downloadLink);
                downloadLink.click();

                optionsForm.setLoading(false);

                Ext.defer(function() {
                    URL.revokeObjectURL(url);
                    downloadLink.remove();
                }, 500);
            }
        });
    },

    onResetOptionsClick: function() {
        this.getOptionsForm().reset();
    },


    // controller methods
    buildFilters: function() {
        var filters = this.getOptionsForm().getValues();

        filters.status = 'published';

        return filters;
    },

    loadPrintout: function(callback) {
        var printoutCmp = this.getPrintoutCmp();

        if (callback) {
            printoutCmp.on('previewload', callback, null, { single: true });
        }

        printoutCmp.setLoading('Loading printout&hellip;');
        printoutCmp.iframeEl.dom.src = Slate.API.buildUrl('/progress/section-interim-reports/*print?'+Ext.Object.toQueryString(this.buildFilters()));
    }
});