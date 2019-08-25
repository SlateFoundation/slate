/**
 * The Progress Section Interim Report Controller handles
 * managing the Section Interim Reports tab within the
 * Student Progress section of the app
 *
 * ## Responsibilities
 * - Realize /progress/interims/reports route
 * - Enable creating / editing section interim reports for students
 * - Enable creating / editing section interim notes
 */
Ext.define('SlateAdmin.controller.progress.interims.Report', {
    extend: 'Ext.app.Controller',


    views: [
        'progress.interims.Manager'
    ],

    stores: [
        'Terms@Slate.store',
        'progress.interims.Sections',
        'progress.interims.Students',
        'progress.interims.Reports'
    ],

    models: [
        'course.SectionTermData'
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
        deleteBtn: 'progress-interims-editorform button#deleteBtn',
        saveDraftBtn: 'progress-interims-editorform button#saveDraftBtn',
        saveFinishedBtn: 'progress-interims-editorform button#saveFinishedBtn',
        sectionNotesForm: 'progress-interims-manager progress-sectionnotesform',
        sectionNotesRevertBtn: 'progress-interims-manager progress-sectionnotesform button#revertBtn',
        sectionNotesSaveBtn: 'progress-interims-manager progress-sectionnotesform button#saveBtn'
    },

    routes: {
        'progress/interims/report': 'showInterims'
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
        deleteBtn: {
            click: 'onDeleteClick'
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
        navPanel.setActiveLink('progress/interims/report');
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
        var me = this,
            sectionsGrid = me.getSectionsGrid(),
            section = sectionsGrid.getSelection()[0],
            studentsGrid = me.getStudentsGrid(),
            studentsStore = studentsGrid.getStore(),
            reportsStore = me.getProgressInterimsReportsStore(),
            editorForm = me.getEditorForm();

        // reselect section if already selected
        if (section) {
            sectionsGrid.setSelection(null);
            sectionsGrid.setSelection(section);
        } else {
            // reset stores
            studentsStore.removeAll();
            studentsGrid.getView().clearEmptyEl(); // PRIVATE: clearEmptyEl to remove empty text
            reportsStore.removeAll();

            // reset form
            editorForm.disable();
            editorForm.reset(true);

            // reset students list
            studentsGrid.disable();
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
            sectionNotesForm = me.getSectionNotesForm(),
            term = me.getTermSelector().getSelection(),
            termHandle = me.getTermSelector().getValue(),
            sectionCode = section.get('Code'),
            SectionTermDataModel = me.getCourseSectionTermDataModel();

        // reset stores
        studentsStore.removeAll();
        reportsStore.removeAll();

        // reset form
        editorForm.disable();
        editorForm.reset(true);

        // configure grid
        studentsGrid.enable();

        // configure and load stores
        studentsStore.getProxy().setUrl('/sections/'+sectionCode+'/students');
        studentsStore.load();

        reportsProxy.setExtraParam('term', termHandle);
        reportsProxy.setExtraParam('course_section', sectionCode);
        reportsStore.load();

        sectionNotesForm.enable();
        sectionNotesForm.setLoading('Loading notes&hellip;');

        SectionTermDataModel.getProxy().createOperation('read', {
            params: {
                term: termHandle,
                'course_section': sectionCode
            },
            callback: function(sectionTermDataRecords, operation, success) {
                var sectionTermDataRecord = sectionTermDataRecords[0];

                if (!success) {
                    return;
                }

                if (!sectionTermDataRecord) {
                    sectionTermDataRecord = new SectionTermDataModel({
                        TermID: term.getId(),
                        SectionID: section.getId()
                    });
                }

                sectionNotesForm.setLoading(false);
                sectionNotesForm.loadRecord(sectionTermDataRecord);
                me.syncSectionNotesFormButtons();
            }
        }).execute();

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
            sectionDataRecord = sectionNotesForm.getRecord(),
            section = this.getProgressInterimsSectionsStore().getById(sectionDataRecord.get('SectionID'));

        if (!section) {
            return;
        }

        sectionNotesForm.updateRecord(sectionDataRecord);

        if (!sectionDataRecord.dirty) {
            return;
        }

        sectionNotesForm.setLoading('Saving notes&hellip;');
        sectionDataRecord.save({
            callback: function(sectionData, operation, success) {
                sectionNotesForm.setLoading(false);

                if (success) {
                    sectionNotesForm.loadRecord(sectionData);
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

        Ext.Msg.confirm('Reverting Changes', 'Are you sure you want to revert your changes?', function (btn) {
            if (btn == 'yes') {
                me.getEditorForm().reset();
            }
        });
    },

    onDeleteClick: function() {
        var me = this,
            managerCt = me.getManagerCt(),
            editorForm = me.getEditorForm(),
            report = editorForm.getRecord();

        Ext.Msg.confirm('Delete Report', 'Are you sure you want to permenantly delete this report?', function(btn) {
            if (btn != 'yes') {
                return;
            }

            managerCt.setLoading('Deleting report&hellip');

            me.fireEvent('beforereportdelete', report);

            report.erase({
                callback: function(report, operation, success) {
                    var student = report.get('student'),
                        studentsSelModel = me.getStudentsGrid().getSelectionModel();

                    managerCt.setLoading(false);

                    if (success) {
                        student.beginEdit();
                        student.set('report', null);
                        me.syncStudent(student);
                        student.endEdit();

                        me.fireEvent('reportdelete', report);

                        // reselect current student
                        studentsSelModel.deselectAll();
                        studentsSelModel.select(student);
                    } else {
                        Ext.Msg.alert('Failed to delete report', 'This report failed to delete from the server:<br><br>' + (operation.getError() || 'Unknown reason, try again or contact support'));
                    }
                }
            });
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
            termsStore = me.getTermsStore(),
            term = termSelector.getValue();

        // ensure terms are loaded
        if (!termsStore.isLoaded()) {
            managerCt.setLoading('Loading terms&hellip;');
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
                termSelector.setSelection(term);
            } else {
                Ext.Msg.alert('No term available', 'No current or reporting term could be detected, please select a term');
            }

            return; // setting the term will call this function again via the change event
        }

        sectionsProxy.setExtraParam('enrolled_user', myClassesOnlyCheckbox.getValue() ? '*current' : '');
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
            report = reportsStore.getAt(reportsStore.findExact('StudentID', student.getId()));

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
        me.getDeleteBtn().setDisabled(report.phantom);
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