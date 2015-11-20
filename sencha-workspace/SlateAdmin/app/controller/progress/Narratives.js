/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/

/**
 * TODO:
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

    models: [
        'progress.narratives.SectionNotes'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        managerCt: {
            selector: 'progress-narratives-manager',
            autoCreate: true,

            xtype: 'progress-narratives-manager'
        },
        myClassesToggleBtn: 'progress-narratives-sectionsgrid button[action=myClassesToggle]',
        termSelector: 'progress-narratives-sectionsgrid #termSelector',
        sectionsGrid: 'progress-narratives-sectionsgrid',
        studentsGrid: 'progress-narratives-studentsgrid',
        sectionNotesForm: 'progress-narratives-sectionnotesform',
        sectionNotesRevertBtn: 'progress-narratives-sectionnotesform button#revertBtn',
        sectionNotesSaveBtn: 'progress-narratives-sectionnotesform button#saveBtn',
        editorForm: 'progress-narratives-editorform',
        revertChangesBtn: 'progress-narratives-editorform button#revertChangesBtn',
        saveDraftBtn: 'progress-narratives-editorform button#saveDraftBtn',
        saveFinishedBtn: 'progress-narratives-editorform button#saveFinishedBtn'

        // narrativesPrinter: {
        //     selector: 'progress-narratives-printer',
        //     autoCreate: true,

        //     xtype: 'progress-narratives-printer'
        // },
        // narrativesPrintForm: 'progress-narratives-printer form'
    },

    routes: {
        'progress/narratives': 'showNarratives'
        // 'progress/narratives/printing': 'showNarrativePrinting'
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
            beforeselect: 'onBeforeSectionSelect',
            select: 'onSectionSelect'
        },

        studentsGrid: {
            beforeselect: 'onBeforeStudentSelect',
            select: 'onStudentSelect'
        },
        sectionNotesForm: {
            dirtychange: 'onSectionNotesFormDirtyChange'
        },
        sectionNotesRevertBtn: {
            click: 'onSectionNotesRevertBtnClick'
        },
        sectionNotesSaveBtn: {
            click: 'onSectionNotesSaveBtnClick'
        },

        editorForm: {
            dirtychange: 'onEditorFormDirtyChange',
            validitychange: 'onEditorFormValidityChange'
        },
        'progress-narratives-editorform combo': {
            select: 'onComboSelect'
        },
        revertChangesBtn: {
            click: 'onRevertChangesClick'
        },
        saveDraftBtn: {
            click: 'onSaveDraftClick'
        },
        saveFinishedBtn: {
            click: 'onSaveFinishedClick'
        }

        // 'progress-narratives-printer': {
        //     activate: 'onPrinterActivate'
        // },
        // 'progress-narratives-printer button[action=clear-filters]': {
        //     click: 'onNarrativesClearFiltersClick'
        // },
        // 'progress-narratives-printer button[action=preview]': {
        //     click: 'onNarrativesPreviewClick'
        // },
        // 'progress-narratives-printer button[action=print-pdf]': {
        //     click: 'onNarrativesPrintPdfClick'
        // },
        // 'progress-narratives-printer button[action=print-browser]': {
        //     click: 'onNarrativesPrintBrowserClick'
        // }
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
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/narratives');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManagerCt());

        Ext.resumeLayouts(true);
    },

    // showNarrativePrinting: function () {
    //     this.application.getController('Viewport').loadCard(this.getNarrativesPrinter());
    // },


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

    onBeforeSectionSelect: function(sectionsSelModel, section) {
        var me = this,
            editorForm = me.getEditorForm(),
            loadedReport = editorForm.getRecord();

        if (loadedReport && editorForm.isDirty()) {
            Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                if (btn != 'yes') {
                    return;
                }

                editorForm.reset();
                sectionsSelModel.select([section]);
            });

            return false;
        }
    },

    onSectionSelect: function (sectionsGrid, section) {
        var me = this,
            studentsGrid = me.getStudentsGrid(),
            studentsStore = studentsGrid.getStore(),
            reportsStore = Ext.getStore('progress.narratives.Reports'),
            reportsProxy = reportsStore.getProxy(),
            editorForm = me.getEditorForm(),
            term = me.getTermSelector().getSelection(),
            termHandle = me.getTermSelector().getValue(),
            sectionCode = section.get('Code'),
            sectionNotesForm = me.getSectionNotesForm(),
            SectionNotesModel = me.getProgressNarrativesSectionNotesModel();

        // reset stores
        studentsStore.removeAll();
        reportsStore.removeAll();

        // reset form
        editorForm.disable();
        editorForm.reset(true);

        // configure grid
        studentsGrid.enable();

        // configure and load stores
        studentsStore.getProxy().setUrl('/sections/'+section.get('Code')+'/students');
        studentsStore.load();

        reportsProxy.setExtraParam('term', termHandle);
        reportsProxy.setExtraParam('course_section', sectionCode);
        reportsStore.load();

        // load section notes model
        sectionNotesForm.enable();
        sectionNotesForm.setLoading('Loading notes&hellip;');
        SectionNotesModel.getProxy().createOperation('read', {
            params: {
                term: termHandle,
                course_section: sectionCode
            },
            callback: function(sectionNotes, operation, success) {
                if (!success) {
                    return;
                }

                if (!(sectionNotes = sectionNotes[0])) {
                    sectionNotes = new SectionNotesModel({
                        TermID: term.getId(),
                        CourseSectionID: section.getId()
                    });
                }

                sectionNotesForm.setLoading(false);
                sectionNotesForm.loadRecord(sectionNotes);
                me.syncSectionNotesFormButtons();
            }
        }).execute();
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

    onBeforeStudentSelect: function (studentsSelModel, student) {
        var me = this,
            editorForm = me.getEditorForm(),
            loadedReport = editorForm.getRecord();

        if (loadedReport && editorForm.isDirty()) {
            Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                if (btn != 'yes') {
                    return;
                }

                editorForm.reset();
                studentsSelModel.select([student]);
            });

            return false;
        }
    },

    onStudentSelect: function (studentsGrid, student) {
        var me = this,
            editorForm = me.getEditorForm(),
            report = student.get('report'),
            section, term;

        if (!report) {
            section = me.getSectionsGrid().getSelection()[0];
            term = me.getTermSelector().getSelection();

            report = me.getProgressNarrativesReportsStore().add({
                StudentID: student.getId(),
                CourseSectionID: section.getId(),
                TermID: term.getId(),

                student: student,
                section: section,
                term: term
            })[0];

            student.set('report', report, { dirty: false });
        }

        editorForm.enable();
        editorForm.setScrollY(0, true);
        editorForm.loadRecord(report);
        me.syncFormButtons();

        me.fireEvent('reportload', report);
    },

    onSectionNotesFormDirtyChange: function() {
        this.syncSectionNotesFormButtons();
    },

    onSectionNotesRevertBtnClick: function() {
        this.getSectionNotesForm().reset();
    },

    onSectionNotesSaveBtnClick: function() {
        var sectionNotesForm = this.getSectionNotesForm(),
            sectionNotes = sectionNotesForm.getRecord();

        sectionNotesForm.updateRecord(sectionNotes);

        if (!sectionNotes.dirty) {
            return;
        }

        sectionNotesForm.setLoading('Saving notes&hellip;');
        sectionNotes.save({
            callback: function(sectionNotes, operation, success) {
                sectionNotesForm.setLoading(false);

                if (success) {
                    sectionNotesForm.loadRecord(sectionNotes);
                } else {
                    Ext.Msg.alert('Failed to save section notes', 'The section notes failed to save to the server:<br><br>' + (operation.getError() || 'Unknown reason, try again or contact support'));
                }
            }
        });
    },

    onEditorFormDirtyChange: function() {
        this.syncFormButtons();
    },

    onEditorFormValidityChange: function() {
        this.syncFormButtons();
    },

    onComboSelect: function (combo, newValue) {
        var fields = this.getEditorForm().query('field, htmleditor'),
            nextFieldIndex = fields.indexOf(combo) + 1;

        if (nextFieldIndex < fields.length) {
            fields[nextFieldIndex].focus(true, 100);
        }
    },

    onRevertChangesClick: function() {
        var me = this;

        Ext.Msg.confirm('Reverting Changes', 'Are you sure you want to revert your changes', function (btn) {
            if (btn == 'yes') {
                me.getEditorForm().reset();
            }
        });
    },

    onSaveDraftClick: function () {
        this.saveReport('draft');
    },

    onSaveFinishedClick: function () {
        this.saveReport('published');
    },

    // onPrinterActivate: function (managerCt) {
    //     var termSelector = this.getNarrativesPrinter().down('combo[name=termID]'),
    //         selectedTerm = termSelector.getValue(),
    //         termStore = Ext.getStore('Terms'),
    //         advisorStore = Ext.getStore('people.Advisors'),
    //         onTermLoad = function () {
    //             if(!selectedTerm) {
    //                 termSelector.setValue(termStore.getReportingTerm().getId());
    //                 managerCt.setLoading(false);
    //             }


    //         };

    //     if(!termStore.isLoaded()) {
    //         managerCt.setLoading('Loading terms&hellip;');
    //         termStore.load({
    //             callback: onTermLoad
    //         });
    //     }

    //     if(!advisorStore.isLoaded()) {
    //         advisorStore.load();
    //     }
    // },

    // onNarrativesPreviewClick: function () {
    //     var formValues = this.getNarrativesPrintForm().getForm().getValues();
    //     this.getNarrativesPrinter().loadPreview(formValues);
    // },

    // onNarrativesPrintPdfClick: function () {
    //     var formValues = this.getNarrativesPrintForm().getForm().getValues();
    //     this.getNarrativesPrinter().loadPrint(formValues);
    // },

    // onNarrativesPrintBrowserClick: function () {
    //     var formValues = this.getNarrativesPrintForm().getForm().getValues();
    //     this.getNarrativesPrinter().loadPreview(formValues, true);
    // },

    // onNarrativesClearFiltersClick: function () {
    //     this.getNarrativesPrintForm().getForm().reset();
    // },


    saveReport: function (newStatus) {
        var me = this,
            managerCt = me.getManagerCt(),
            editorForm = me.getEditorForm(),
            formData  = editorForm.getValues(),
            report = editorForm.getRecord();

        report.beginEdit();

        if (newStatus) {
            report.set('Status', newStatus);
        }

        report.set(formData);

        // TODO: remove this check and instead publish a cancelable beforesave event for plugin to handle this
        // if (report.get('Status') == 'Published' && !report.get('Grade')) {
        //     Ext.Msg.alert('Report not saved', 'Narrative report cannot be marked finished without a grade');
        //     return false;
        // }

        report.endEdit();

        managerCt.setLoading('Saving report&hellip');

        me.fireEvent('beforereportsave', report);

        report.save({
            callback: function(report, operation, success) {
                managerCt.setLoading(false);

                if (success) {
                    report.get('student').set({
                        report_status: report.get('Status'),
                        report_modified: report.get('Modified') || report.get('Created')
                    }, { dirty: false });

                    editorForm.loadRecord(report);

                    me.fireEvent('reportsave', report);

                    if (!me.getStudentsGrid().getSelectionModel().selectNext()) {
                        me.syncFormButtons();
                    }
                } else {
                    Ext.Msg.alert('Failed to save report', 'This report failed to save to the server:<br><br>' + (operation.getError() || 'Unknown reason, try again or contact support'));
                }
            }
        });
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
        var section = this.getSectionsGrid().getSelection()[0],
            termsStore = Ext.getStore('Terms'),
            studentsStore = Ext.getStore('progress.narratives.Students'),
            reportsStore = Ext.getStore('progress.narratives.Reports'),
            studentsLength = studentsStore.getCount(), i = 0, student,
            report;

        studentsStore.beginUpdate();
        reportsStore.beginUpdate();

        for (; i < studentsLength; i++) {
            student = studentsStore.getAt(i);
            report = reportsStore.query('StudentID', student.getId()).first();
            student.set({
                report: report || null,
                report_status: report ? report.get('Status') : null,
                report_modified: report ? report.get('Modified') || report.get('Created') : null
            }, { dirty: false });

            if (report) {
                report.set({
                    student: student,
                    section: section,
                    term: termsStore.getById(report.get('TermID')) || null
                }, { dirty: false });
            }
        }

        reportsStore.endUpdate();
        studentsStore.endUpdate();
    },

    syncSectionNotesFormButtons: function() {
        var me = this,
            isDirty = this.getSectionNotesForm().isDirty();

        me.getSectionNotesRevertBtn().setDisabled(!isDirty);
        me.getSectionNotesSaveBtn().setDisabled(!isDirty);
    },

    syncFormButtons: function() {
        var me = this,
            editorForm = me.getEditorForm(),
            report = editorForm.getRecord(),
            reportStatus = report && report.get('Status'),
            isDirty = editorForm.isDirty(),
            isValid = editorForm.isValid();

        if (!report) {
            return;
        }

        me.getRevertChangesBtn().setDisabled(!isDirty);
        me.getSaveDraftBtn().setDisabled((!isDirty && reportStatus == 'draft') || !isValid);
        me.getSaveFinishedBtn().setDisabled((!isDirty && reportStatus == 'published') || !isValid);
    }
});