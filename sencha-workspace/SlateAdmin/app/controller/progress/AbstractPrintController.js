/**
 * @abstract
 * Shared implementation for the progress report printing sections — the
 * interims and terms controllers are identical apart from their module
 * routes and API endpoints, declared via the contract below.
 *
 * ## Responsibilities
 * - Enable exporting section reports as CSV
 * - Enable printing section reports via browser
 */
Ext.define('SlateAdmin.controller.progress.AbstractPrintController', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Ext.util.CSV',

        /* global Slate:false */
        'Slate.API'
    ],


    // subclass contract
    moduleRoute: null, // e.g. 'progress/interims/print'
    reportsApiPath: null, // e.g. '/progress/section-interim-reports'
    csvFileName: null, // e.g. 'interim-reports.csv'


    control: {
        loadPrintoutBtn: {
            click: 'onLoadPrintoutClick'
        },
        printPrintoutBtn: {
            click: 'onPrintPrintoutClick'
        },
        openTabBtn: {
            click: 'onOpenTabClick'
        },
        saveCsvBtn: {
            click: 'onSaveCsvClick'
        },
        resetOptionsBtn: {
            click: 'onResetOptionsClick'
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
    onLoadPrintoutClick: function() {
        this.loadPrintout();
    },

    onPrintPrintoutClick: function() {
        this.loadPrintout(function(previewCmp) {
            try {
                previewCmp.iframeEl.dom.contentWindow.print();
            } catch (err) {
                Ext.Msg.alert(
                    'Printing unavailable',
                    [
                        '<p>Your browser\'s print function could not be triggered automatically.</p>',
                        '<p>Try using the <strong>Open in Browser Tab</strong> button instead and printing manually</p>'
                    ].join('')
                );
            }
        });
    },

    onOpenTabClick: function() {
        window.open(this.buildHtmlUrl());
    },

    onSaveCsvClick: function() {
        var me = this,
            optionsForm = me.getOptionsForm();

        optionsForm.setLoading('Preparing CSV&hellip;');

        Slate.API.request({
            method: 'GET',
            url: me.reportsApiPath,
            params: Ext.apply({
                include: 'Student.Advisor,Section.Teachers'
            }, me.buildReportParams()),
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
                downloadLink.download = me.csvFileName;
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
    buildReportParams: function() {
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

    buildHtmlUrl: function() {
        return Slate.API.buildUrl(this.reportsApiPath + '?' + Ext.Object.toQueryString(this.buildReportParams()));
    },

    loadPrintout: function(callback) {
        var printoutCmp = this.getPrintoutCmp(),
            url = this.buildHtmlUrl();

        // skip load if URL is the same
        if (printoutCmp.iframeEl.dom.src === url) {
            Ext.callback(callback, null, [printoutCmp]);
            return;
        }

        if (callback) {
            printoutCmp.on('previewload', callback, null, { single: true });
        }

        printoutCmp.setLoading('Loading printout&hellip;');
        printoutCmp.iframeEl.dom.src = url;
    }
});
