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
        narrativesPrintForm: 'progress-narratives-printer form'
    },

    control: {
        narrativesPrinter: {
            activate: 'onPrinterActivate'
        },
        'progress-narratives-printer button[action=clear-filters]': {
            click: 'onNarrativesClearFiltersClick'
        },
        'progress-narratives-printer button[action=preview]': {
            click: 'onNarrativesPreviewClick'
        },
        'progress-narratives-printer button[action=print-pdf]': {
            click: 'onNarrativesPrintPdfClick'
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
        var formValues = this.getNarrativesPrintForm().getForm().getValues();
        this.getNarrativesPrinter().loadPreview(formValues);
    },

    onNarrativesPrintPdfClick: function () {
        var formValues = this.getNarrativesPrintForm().getForm().getValues();
        this.getNarrativesPrinter().loadPrint(formValues);
    },

    onNarrativesPrintBrowserClick: function () {
        var formValues = this.getNarrativesPrintForm().getForm().getValues();
        this.getNarrativesPrinter().loadPreview(formValues, true);
    },

    onNarrativesClearFiltersClick: function () {
        this.getNarrativesPrintForm().getForm().reset();
    }
});
