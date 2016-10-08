Ext.define('SlateAdmin.controller.progress.Interims', {
    extend: 'Ext.app.Controller',


    views: [
        'progress.interims.Manager'
    ],

    stores: [
        'Terms',
        'progress.interims.Sections',
        'progress.interims.Students',
        'progress.interims.Reports'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        managerCt: {
            selector: 'progress-interims-manager',
            autoCreate: true,

            xtype: 'progress-interims-manager'
        },
        myClassesOnlyCheckbox: 'progress-interims-sectionsgrid checkboxfield[name=myClassesOnly]',
        termSelector: 'progress-interims-sectionsgrid #termSelector',
        sectionsGrid: 'progress-interims-sectionsgrid',
        studentsGrid: 'progress-interims-studentsgrid',
        editorForm: 'progress-interims-editorform',
        revertChangesBtn: 'progress-interims-editorform button#revertChangesBtn',
        saveDraftBtn: 'progress-interims-editorform button#saveDraftBtn',
        saveFinishedBtn: 'progress-interims-editorform button#saveFinishedBtn'
    },

    routes: {
        'progress/interims': 'showInterims'
    },

    control: {
        managerCt: {
            activate: 'onManagerActivate'
        },

        myClassesOnlyCheckbox: {
            change: 'onMyClassesOnlyCheckboxChange'
        },
        termSelector: {
            beforeselect: 'onBeforeTermSelect',
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
        'progress-interims-editorform combo': {
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
    },

    listen: {
        store: {
            '#progress.interims.Sections': {
                load: 'onSectionsStoreLoad'
            },
            '#progress.interims.Students': {
                load: 'onStudentsStoreLoad'
            }
        }
    },


    // route handlers
    showInterims: function () {
        var me = this,
            navPanel = me.getProgressNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('progress/interims');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManagerCt());

        Ext.resumeLayouts(true);
    },

    // event handlers
    onManagerActivate: function () {
        this.syncSections();
    },

    onMyClassesOnlyCheckboxChange: function () {
        this.syncSections();
    },

    onBeforeTermSelect: function(termSelector, term) {
        var me = this,
            editorForm = me.getEditorForm(),
            loadedReport = editorForm.getRecord();

        if (loadedReport && editorForm.isDirty()) {
            Ext.Msg.confirm('Unsaved Changes', 'You have unsaved changes to this report.<br/><br/>Do you want to continue without saving them?', function (btn) {
                if (btn != 'yes') {
                    return;
                }

                editorForm.reset();
                termSelector.select(term);
            });

            return false;
        }
    },

    onTermChange: function () {
        this.syncSections();
    },

    onSectionsStoreLoad: function() {
        var sectionsGrid = this.getSectionsGrid(),
            section = sectionsGrid.getSelection()[0];

        // reselect section if already selected
        if (section) {
            sectionsGrid.setSelection(null);
            sectionsGrid.setSelection(section);
        }
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
            reportsStore = me.getProgressInterimsReportsStore(),
            reportsProxy = reportsStore.getProxy(),
            editorForm = me.getEditorForm(),
            termHandle = me.getTermSelector().getValue(),
            sectionCode = section.get('Code');

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
    },

    onStudentsStoreLoad: function() {
        var me = this,
            studentsView = me.getStudentsGrid().getView(),
            reportsStore = me.getProgressInterimsReportsStore();

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

            report = me.getProgressInterimsReportsStore().add({
                StudentID: student.getId(),
                SectionID: section.getId(),
                TermID: term.getId(),

                student: student,
                section: section,
                term: term
            })[0];

            student.set('report', report, { dirty: false });
        }

        me.fireEvent('beforereportload', report);

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

    saveReport: function (newStatus) {
        var me = this,
            managerCt = me.getManagerCt(),
            editorForm = me.getEditorForm(),
            formData = editorForm.getValues(),
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
                var student = report.get('student');

                managerCt.setLoading(false);

                if (success) {
                    student.beginEdit();
                    me.syncStudent(student);
                    student.endEdit();

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
            sectionsStore = me.getProgressInterimsSectionsStore(),
            sectionsProxy = sectionsStore.getProxy(),
            managerCt = me.getManagerCt(),
            myClassesOnlyCheckbox = me.getMyClassesOnlyCheckbox(),
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

        sectionsProxy.setExtraParam('enrolled_user', myClassesOnlyCheckbox.getValue() ? 'current' : '');
        sectionsProxy.setExtraParam('term', term);
        sectionsStore.loadIfDirty();
    },

    syncReportsToStudents: function() {
        var me = this,
            section = me.getSectionsGrid().getSelection()[0],
            termsStore = me.getTermsStore(),
            studentsStore = me.getProgressInterimsStudentsStore(),
            reportsStore = me.getProgressInterimsReportsStore(),
            studentsLength = studentsStore.getCount(), i = 0, student,
            report;

        studentsStore.beginUpdate();
        reportsStore.beginUpdate();

        for (; i < studentsLength; i++) {
            student = studentsStore.getAt(i);
            report = reportsStore.query('StudentID', student.getId()).first();

            student.beginEdit();
            student.set('report', report || null, { dirty: false });
            me.syncStudent(student);
            student.endEdit();

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
    },

    syncStudent: function(student) {
        var report = student.get('report');

        student.set({
            report_status: report ? report.get('Status') : null,
            report_modified: report ? report.get('Modified') || report.get('Created') : null
        }, { dirty: false });
    }
});