/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/

/**
 * TODO:
 * - Sort control statements
 * - Sort methods
 * - Remove redundant "narrative" ref prefixing
 * - Remove all SBG code from core
 * - Move printer functionality to its own controller
 */
Ext.define('SlateAdmin.controller.progress.Narratives', {
    extend: 'Ext.app.Controller',


    views: [
        'progress.narratives.Manager',
        'progress.narratives.Printer'
    ],

    stores: [
        'people.Advisors',
        'progress.narratives.Sections',
        'progress.narratives.Students',
        'progress.narratives.Reports'
    ],

    refs: {
        managerCt: {
            selector: 'progress-narratives-manager',
            autoCreate: true,

            xtype: 'progress-narratives-manager'
        },
        myClassesToggleBtn: 'progress-narratives-sectionsgrid button[action=myClassesToggle]',
        termSelector: 'progress-narratives-sectionsgrid #termSelector',
        sectionsGrid: 'progress-narratives-sectionsgrid',
        studentsGrid: 'progress-narratives-studentsgrid',
        editorForm: 'progress-narratives-editor',

        narrativesPrinter: {
            selector: 'progress-narratives-printer',
            autoCreate: true,

            xtype: 'progress-narratives-printer'
        },
        narrativesPrintForm: 'progress-narratives-printer form'
    },

    routes: {
        'progress/narratives': 'showNarratives',
        'progress/narratives/printing': 'showNarrativePrinting'
    },

    control: {
        managerCt: {
            activate: 'onManagerActivate'
        },

        myClassesToggleBtn: {
            toggle: 'onMyClassesToggle'
        },
        termSelector: {
            change: 'onTermChange'
        },
        sectionsGrid: {
            select: 'onSectionSelect'
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
        }
    },

    listen: {
        store: {
            '#progress.narratives.Students': {
                load: 'onStudentsStoreLoad'
            }
        }
    },


    // route handlers
    showNarratives: function () {
        this.application.getController('Viewport').loadCard(this.getManagerCt());
    },

    showNarrativePrinting: function () {
        this.application.getController('Viewport').loadCard(this.getNarrativesPrinter());
    },


    // event handlers
    onManagerActivate: function () {
        this.syncSections();
    },

    onMyClassesToggle: function () {
        this.syncSections();
    },

    onTermChange: function () {
        this.syncSections();
    },

    onSectionSelect: function (sectionsGrid, section) {
        var me = this,
            studentsGrid = me.getStudentsGrid(),
            studentsStore = studentsGrid.getStore(),
            reportsStore = Ext.getStore('progress.narratives.Reports'),
            reportsProxy = reportsStore.getProxy();

        // reset stores
        studentsStore.removeAll();
        reportsStore.removeAll();

        // configure grid
        studentsGrid.enable();

        // configure and load stores
        studentsStore.getProxy().setUrl('/sections/'+section.get('Code')+'/students');
        studentsStore.load();

        reportsProxy.setExtraParam('term', me.getTermSelector().getValue());
        reportsProxy.setExtraParam('course_section', section.get('Code'));
        reportsStore.load();
    },

    onStudentsStoreLoad: function() {
        var me = this,
            studentsView = me.getStudentsGrid().getView(),
            reportsStore = Ext.getStore('progress.narratives.Reports');

        if (reportsStore.isLoading()) {
            studentsView.setLoading('Loading reports&hellip;');
            reportsStore.on('load', function() {
                studentsView.setLoading(false);

                // restore original loading text
                studentsView.loadMask.msg = studentsView.loadingText;

                me.syncReportsToStudents();
            }, me, { single: true });
        } else {
            me.syncReportsToStudents();
        }
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

    onBeforeNarrativeSelect: function (view, record) {
        var me = this,
            editor = me.getNarrativeEditor(),
            managerCt = me.getManagerCt(),
            grid = me.getNarrativesGrid(),
            narrative = managerCt.getNarrative(),
            isDirty = editor.isDirty(),
            narrativeSaved = managerCt.getNarrativeSaved();

            if (!narrativeSaved && narrative && isDirty) {
                Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                    if (btn == 'yes') {
                        managerCt.setNarrativeSaved(true);
                        managerCt.updateNarrative(narrative);

                        grid.getSelectionModel().select([record]);
                    }
                });

                return false;
            }
    },

    onNarrativeSelect: function (view, record) {
        var me = this,
            editor = me.getNarrativeEditor(),
            managerCt = me.getManagerCt(),
            assignment = editor.getWorksheet();

        editor.enable();
        editor.body.scrollTo('top', 0);

        managerCt.setNarrative(record);
        managerCt.setNarrativeSaved(true);

        me.loadStandards(assignment.get('WorksheetID') ? record : false);
    },

    onEditorDirtyChange: function (field, dirty) {
        this.getManagerCt().setNarrativeSaved(false);
    },

    onNarrativeSaved: function () {
        this.saveReport('Draft');
    },

    onNarrativeFinished: function () {
        this.saveReport('Published');
    },

    onSavedReportsToggle: function (button, pressed) {
        var editor = this.getNarrativeEditor(),
            store = Ext.getStore('progress.Narratives');

        editor.disable();

        if (pressed) {
            store.load({url: '/progress/narratives/all'});
        } else {
            store.load({url: '/progress/narratives/mystudents'});
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
    revertChanges: function () {
        var me = this,
            managerCt = me.getManagerCt(),
            courseWorksheteID = me.getNarrativesWorksheetGrid().getSelectionModel().getSelection()[0].get('WorksheetID');

        Ext.Msg.confirm('Reverting Changes', 'Are you sure you want to revert your changes', function (btn) {
            if (btn == 'yes') {
                var narartive = managerCt.getNarrative();
                managerCt.updateNarrative(narartive);
                me.loadStandards(courseWorksheteID ? narartive : false);
                managerCt.setNarrativeSaved(true);
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
            managerCt = me.getManagerCt(),
            editor = me.getNarrativeEditor(),
            reportData  = editor.getValues(),
            narrative = managerCt.getNarrative();

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
            managerCt = me.getManagerCt(),
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

        SlateAdmin.API.request({
            url: '/progress/narratives/worksheet-save',
            submitEmptyText: false,
            method: 'POST',
            params: Ext.Object.merge({
                courseSectionID: narrative.get('CourseSectionID'),
                termID: narrative.get('TermID'),
                studentID: narrative.get('StudentID'),
                narrativeID: narrative.get('ID'),
                Status: reportData.Status
            }, editor.getForm().getValues()),
            success: function (resposne) {

                 r = Ext.decode(resposne.responseText);

                if (editor) {
                    editor.setLoading(false);
                }

                me.mergeNarrative(narrative, r);

                narrative.commit();

                managerCt.setNarrativeSaved(true);

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

            if (nextCombo) {
                nextCombo.focus();
            } else {
                combo.up('progress-narratives-editor').down('htmleditor').focus(true, 100);
            }
        }
    },


    // controller methods
    syncSections: function() {
        var me = this,
            sectionsStore = Ext.getStore('progress.narratives.Sections'),
            sectionsProxy = sectionsStore.getProxy(),
            managerCt = me.getManagerCt(),
            myClassesToggleBtn = me.getMyClassesToggleBtn(),
            termSelector = me.getTermSelector(),
            termsStore = termSelector.getStore(),
            term = termSelector.getValue();

        // ensure terms are loaded
        if (!termsStore.isLoaded()) {
            termsStore.on('load', function() {
                managerCt.setLoading(false);
                me.syncSections();
            }, me, { single: true });

            if (!termsStore.isLoading()) {
                termsStore.load();
            }

            return;
        }

        // ensure a term is selected
        if (!term) {
            term = termsStore.getReportingTerm() || termsStore.getCurrentTerm();
            if (term) {
                termSelector.setValue(term);
            } else {
                Ext.Msg.alert('No term available', 'No current or reporting term could be detected, please select a term');
            }

            return; // setting the term will call this function again via the change event
        }

        sectionsProxy.setExtraParam('enrolled_user', myClassesToggleBtn.pressed ? 'current' : '');
        sectionsProxy.setExtraParam('term', term);
        sectionsStore.loadIfDirty();
    },

    syncReportsToStudents: function() {
        console.info('syncStudentReports');
    }
});
