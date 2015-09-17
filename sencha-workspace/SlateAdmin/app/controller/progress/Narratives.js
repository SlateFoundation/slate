/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.progress.Narratives', {
    extend: 'Ext.app.Controller',

    views: [
        'progress.narratives.Manager',
        'progress.narratives.Printer'
    ],
    stores: [
        'people.Advisors',
        'progress.Narratives',
        'progress.narratives.WorksheetAssignments',
        'progress.narratives.People'
    ],
    refs: {
        narrativesGrid: 'progress-narratives-studentsgrid',
        narrativeEditor: 'progress-narratives-editor',
        narrativesManager: {
            selector: 'progress-narratives-manager',
            autoCreate: true,

            xtype: 'progress-narratives-manager'
        },
        narrativesPrinter: {
            selector: 'progress-narratives-printer',
            autoCreate: true,

            xtype: 'progress-narratives-printer'
        },
        narrativesPrintForm: 'progress-narratives-printer form',
        narrativesTermSelector: 'progress-narratives-grid #termSelector',
        narrativesWorksheetGrid: 'progress-narratives-grid'
    },
    routes: {
        'progress/narratives': 'showNarratives',
        'progress/narratives/printing': 'showNarrativePrinting'
    },
    control: {
        'progress-narratives-manager': {
            activate: 'onManagerActivate'
        },
        'progress-narratives-studentsgrid': {
            select: 'onNarrativeSelect',
            beforeselect: 'onBeforeNarrativeSelect'
        },
        'progress-narratives-printer': {
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
        },
        'progress-narratives-editor button[action=revertChanges]': {
            click: 'revertChanges'
        },
        'progress-narratives-editor button[action=saveDraft]': {
            click: 'onNarrativeSaved'
        },
        'progress-narratives-editor button[action=saveFinished]': {
            click: 'onNarrativeFinished'
        },
        'progress-narratives-editor combo': {
            change: 'onComboValueChange'
        },
        'progress-narratives-editor': {
            dirtychange: 'onEditorDirtyChange'
        },
        'progress-narratives-studentsgrid button[action=loadSavedReports]': {
            toggle: 'onSavedReportsToggle'
        },
        'progress-narratives-grid #termSelector': {
            change: 'onTermChange'
        },
        'progress-narratives-grid': {
            select: 'loadSection',
            edit: 'onNarrativeAssignmentEdit'
        },
        'progress-narratives-grid button[action=myClassesToggle]': {
            toggle: 'onMyClassesToggle'
        }
    },


    //route handlers
    showNarratives: function () {
        this.application.getController('Viewport').loadCard(this.getNarrativesManager());
    },

    showNarrativePrinting: function () {
        this.application.getController('Viewport').loadCard(this.getNarrativesPrinter());
    },

    //event handlers
    onManagerActivate: function (manager) {
        var me = this,
            termStore = Ext.getStore('Terms');

            // ensure terms are loaded
        if (!termStore.isLoaded()) {
            manager.setLoading('Loading terms&hellip;');
            termStore.load({
                callback: function () {
                    manager.setLoading(false);
                    me.loadWorksheets();
                }
            });
        } else {
            me.loadWorksheets();
        }
    },

    onPrinterActivate: function (manager) {
        var termSelector = this.getNarrativesPrinter().down('combo[name=termID]'),
            selectedTerm = termSelector.getValue(),
            termStore = Ext.getStore('Terms'),
            advisorStore = Ext.getStore('people.Advisors'),
            onTermLoad = function () {
                if(!selectedTerm) {
                    termSelector.setValue(termStore.getReportingTerm().getId());
                    manager.setLoading(false);
                }


            };

        if(!termStore.isLoaded()) {
            manager.setLoading('Loading terms&hellip;');
            termStore.load({
                callback: onTermLoad
            });
        }

        if(!advisorStore.isLoaded()) {
            advisorStore.load();
        }
    },

    onMyClassesToggle: function (btn, pressed) {
        var termSelector = this.getNarrativesTermSelector(),
            termID = termSelector.getValue();
        Ext.getStore('progress.narratives.WorksheetAssignments').load({
            url: '/standards/json/' + (pressed ? 'my-sections': 'term-sections'),
            params: {
                termID: termID
            }
        });
    },

    onTermChange: function (field, newValue, oldValue) {
        var grid = this.getNarrativesWorksheetGrid(),
            btn = grid.down('button[action=myClassesToggle]');

        Ext.getStore('progress.narratives.WorksheetAssignments').load({
            url: '/standards/json/' + (btn.pressed ? 'my-sections' : 'term-sections'),
            params: {
                termID: newValue
            }
        });
    },

    onNarrativeAssignmentEdit: function (editor, e) {
        var store = Ext.getStore('progress.narratives.WorksheetAssignments');

        if (e.field == 'WorksheetID' && e.orignalValue != e.value && !e.originalValue) {
            store.on('write', this.onNarrativeWorksheetAssignmentWrite, this, {
                single: true
            });
        }
    },

    onBeforeNarrativeSelect: function (view, record) {
        var me = this,
            editor = me.getNarrativeEditor(),
            manager = me.getNarrativesManager(),
            grid = me.getNarrativesGrid(),
            narrative = manager.getNarrative(),
            isDirty = editor.isDirty(),
            narrativeSaved = manager.getNarrativeSaved();

            if (!narrativeSaved && narrative && isDirty) {
                Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                    if (btn == 'yes') {
                        manager.setNarrativeSaved(true);
                        manager.updateNarrative(narrative);

                        grid.getSelectionModel().select([record]);
                    }
                });

                return false;
            }
    },

    onNarrativeSelect: function (view, record) {
        var me = this,
            editor = me.getNarrativeEditor(),
            manager = me.getNarrativesManager(),
            assignment = editor.getWorksheet();

        editor.enable();
        editor.body.scrollTo('top', 0);

        manager.setNarrative(record);
        manager.setNarrativeSaved(true);

        me.loadStandards(assignment.get('WorksheetID') ? record : false);
    },

    onEditorDirtyChange: function (field, dirty) {
        var manager = this.getNarrativesManager();
        manager.setNarrativeSaved(false);
    },

    onNarrativeSaved: function () {
        this.saveReport('Draft');
    },

    onNarrativeFinished: function () {
        this.saveReport('Published');
    },

    onNarrativeWorksheetAssignmentWrite: function (store, operation) {
        var worksheetGrid = this.getNarrativesWorksheetGrid(),
            selModel = worksheetGrid.getSelectionModel();

        selModel.deselectAll();
        selModel.select(operation.records[0]);
    },

    onSavedReportsToggle: function (button, pressed) {
        var editor = this.getNarrativeEditor(),
            store = Ext.getStore('progress.Narratives');

        editor.disable();

        if (pressed) {
            store.load({url: '/narratives/json/all'});
        } else {
            store.load({url: '/narratives/json/mystudents'});
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
    },


    //helper functions
    loadSection: function (view, record) {
        var me = this,
            termSelector = me.getNarrativesTermSelector(),
            termID = termSelector.getValue(),
            grid = me.getNarrativesGrid();

        grid.enable();

        me.getNarrativeEditor().updateWorksheet(record);

        Ext.getStore('progress.Narratives').load({
            params: {
                courseSectionID: record.get('CourseSectionID'),
                termID: termID
            }
        });
    },

    revertChanges: function () {
        var me = this,
            manager = me.getNarrativesManager(),
            courseWorksheteID = me.getNarrativesWorksheetGrid().getSelectionModel().getSelection()[0].get('WorksheetID');

        Ext.Msg.confirm('Reverting Changes', 'Are you sure you want to revert your changes', function (btn) {
            if (btn == 'yes') {
                var narartive = manager.getNarrative();
                manager.updateNarrative(narartive);
                me.loadStandards(courseWorksheteID ? narartive : false);
                manager.setNarrativeSaved(true);
            }
        });
    },

    loadStandards: function (record) {
        var me = this,
            editor = me.getNarrativeEditor(),
            form = editor.down('#standardsForm'),
            fieldArray = [];

        form.removeAll(true);

        if (!record) {
            return form.update('No worksheet selected for this narrative');
        }

        editor.setLoading(true);
        form.update('');

        Ext.each(record.get('Prompts'), function (grade) {

            fieldArray.push(me.configurePromptField(grade));

        });

        form.add(fieldArray);
        form.doComponentLayout();

        editor.setLoading(false);

    },

    configurePromptField: function (grade) {

        return {
            xtype: 'container',
            cls: 'label-component-ct',
            padding: '4 8',
            layout: 'hbox',
            items: [
                {
                    xtype: 'combobox',
                    cls: 'field-component-labeled',
                    store: ['1', '2', '3', '4', 'N/A'],
                    queryMode: 'local',
                    name: 'prompt-' + grade.PromptID,
                    value: grade.Grade || null,
                    width: 50
                },
                {
                    xtype: 'component',
                    cls: 'field-label-component',
                    itemId: 'prompt-label-' + grade.PromptID,
                    html: grade.Prompt,
                    flex: 1,
                    padding: '4 8',
                    listeners: {
                        render: function (labelCmp) {
                            labelCmp.mon(labelCmp.getEl(), 'click', function (ev, t) {
                                var fieldCmp = labelCmp.prev('combobox');

                                if (fieldCmp) {
                                    fieldCmp.focus();
                                }
                            });
                        }
                    }
                }
            ]
        };
    },

    saveReport: function (newStatus) {
        var me = this,
            manager = me.getNarrativesManager(),
            editor = me.getNarrativeEditor(),
            reportData  = editor.getValues(),
            narrative = manager.getNarrative();

        if (newStatus == 'Published' || (!newStatus && reportData.Status == 'Published')) {
            if (!reportData.Grade) {
                Ext.Msg.alert('Report not saved', 'Narrative report cannot be marked finished without a grade');
                return false;
            }
        }

        if (newStatus) {
            reportData.Status = newStatus;
        }

        me.doSaveReport(narrative, reportData);
    },

    doSaveReport: function (narrative, reportData) {
        var me = this,
            manager = me.getNarrativesManager(),
            editor = me.getNarrativeEditor(),
            grid = me.getNarrativesGrid(),
            selModel = grid.getSelectionModel(),
            prompts = narrative.get('Prompts'),
            r;

        for (var field in reportData) {
            var splitField = field.split('-');

            if (splitField.length == 1) {
                narrative.set(field, reportData[field]);
            } else if (splitField[0] == 'prompt') {
                var prompt = {
                    PromptID: splitField[1],
                    Grade: reportData[field]
                };

                prompts.push(prompt);
            }
        }

        narrative.set('Prompts', prompts);


        editor.setLoading(true);

        editor.getForm().submit({
            url: '/narratives/json/worksheet-save',
            submitEmptyText: false,
            params: {
                courseSectionID: narrative.get('CourseSectionID'),
                termID: narrative.get('TermID'),
                studentID: narrative.get('StudentID'),
                narrativeID: narrative.get('ID'),
                Status: reportData.Status
            },
            success: function (f, action) {

                r = Ext.decode(action.response.responseText);

                if (editor) {
                    editor.setLoading(false);
                }

                me.mergeNarrative(narrative, r);

                narrative.commit();

                manager.setNarrativeSaved(true);

                selModel.selectNext();
            },
            failure: function (form, action) {
                editor.setLoading(false);
            }
        });
    },

    mergeNarrative: function (narrative, saveResponse) {
        var prompts = [],
            savedPrompts = saveResponse.standards;

        narrative.set('Updated', saveResponse.data.Updated);

        for (var key in savedPrompts) {
            prompts.push({
                'PromptID': savedPrompts[key].PromptID,
                'Grade': savedPrompts[key].Grade,
                'Prompt': savedPrompts[key].Prompt.Prompt
            });
        }

        narrative.set('Prompts', prompts);
    },

    onComboValueChange: function (combo, newValue) {
        var nextCombo;

        if (combo.findRecordByValue(newValue)) {
            nextCombo = combo.nextNode('combo');
            combo.triggerBlur();

            if (nextCombo) {
                nextCombo.focus();
            } else {
                combo.up('progress-narratives-editor').down('htmleditor').focus(true, 100);
            }
        }
    },

    loadWorksheets: function() {
         var termSelector = this.getNarrativesTermSelector(),
            termStore = Ext.getStore('Terms'),
            term = termSelector.getValue(),
            reportingTerm = termStore.getReportingTerm(),
            worksheetStore = Ext.getStore('progress.narratives.WorksheetAssignments');

        if(!term && reportingTerm) {
            term = reportingTerm.getId();
            termSelector.setValue(term);
        }

        worksheetStore.load({
            url: '/standards/my-sections',
            params: {
                termID: term
            }
        });
    }
});
