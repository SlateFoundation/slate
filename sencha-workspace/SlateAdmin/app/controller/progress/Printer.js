/*jslint browser: true, undef: true, white: true, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.controller.progress.Printer', {
    extend: 'Ext.app.Controller',

    views: [
        'progress.narratives.Printer'
    ],

    stores: [
        'people.Advisors',
        'progress.narratives.Sections',
        'progress.narratives.Students'
    ],

    routes: {
        'progress/narratives/printing': 'showNarrativePrinting'
    },

    refs: {
        progressNavPanel: 'progress-navpanel',

        narrativesPrinter: {
            selector: 'progress-narratives-printer',
            autoCreate: true,

            xtype: 'progress-narratives-printer'
        },
        narrativesPrintForm: 'progress-narratives-printer form#filterForm',
        narrativesPrintPreviewBox: 'progress-narratives-printer component#previewBox'

    },

    control: {
        narrativesPrinter: {
            activate: 'onPrinterActivate'
        },
        'progress-narratives-printer button[action=clear-filters]': {
            click: 'onClearFiltersClick'
        },
        'progress-narratives-printer button[action=preview]': {
            click: 'onNarrativesPreviewClick'
        },
        'progress-narratives-printer button[action=print-pdf]': {
            click: 'onPrintPdfClick'
        },
        'progress-narratives-printer button[action=print-browser]': {
            click: 'onNarrativesPrintBrowserClick'
        }
    },

    showNarrativePrinting: function () {
        this.application.getController('Viewport').loadCard(this.getNarrativesPrinter());
    },

    onPrinterActivate: function (managerCt) {
        var termSelector = this.getNarrativesPrinter().down('combo[name=termID]'),
            selectedTerm = termSelector.getValue(),
            termStore = Ext.getStore('Terms'),
            advisorStore = Ext.getStore('people.Advisors'),
            onTermLoad = function () {
                if(!selectedTerm) {
                    termSelector.setValue(termStore.getReportingTerm().getId());
                    managerCt.setLoading(false);
                }


            };

        if(!termStore.isLoaded()) {
            managerCt.setLoading('Loading terms&hellip;');
            termStore.load({
                callback: onTermLoad
            });
        }

        if(!advisorStore.isLoaded()) {
            advisorStore.load();
        }
    },

    onNarrativesPreviewClick: function () {
        this.loadPreview();
    },

    onNarrativesPrintBrowserClick: function () {
        this.loadPreview(true);
    },

    onPrintPdfClick: function () {
        var form = this.getNarrativesPrintForm(),
            params = form.getForm().getValues();
            previewBox = this.getNarrativesPrintPreviewBox();

        form.setLoading({msg: 'Preparing PDF, please wait, this may take a minute&hellip;'});
        // use iframe for loading, setting window.location cancels all current loading operations

        SlateAdmin.API.downloadFile('/progress/narratives/reports/print?'+Ext.Object.toQueryString(params), function () {
            form.setLoading(false);
        });

        setTimeout(function() {
            form.setLoading(false);
        }, 1000);
    },

    onClearFiltersClick: function () {
        this.getNarrativesPrintForm().getForm().reset();
    },

    loadPreview: function (invokePrintDialog) {
        var params = this.getNarrativesPrintForm().getForm().getValues();
            previewBox = this.getNarrativesPrintPreviewBox();
            iframeEl = previewBox.iframeEl;

        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});

        iframeEl.on('load', function () {
            this.fireEvent('previewload', this, previewBox);
            previewBox.setLoading(false);

            if (invokePrintDialog) {
                iframeEl.dom.contentWindow.print();
            }
        }, this, { single: true, delay: 10 });

        SlateAdmin.API.request({
            url: '/progress/narratives/reports/print/preview',
            params: params,
            scope: this,
            success: function (res) {
                var doc = document.getElementById(previewBox.iframeEl.dom.id).contentWindow.document;

                doc.open();
                doc.write(res.responseText);
                doc.close();
            }
        });

    }

});
