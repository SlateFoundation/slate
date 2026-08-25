/**
 * The Progress Section Term Report Controller handles
 * managing the Section Term Reports tab within the
 * Student Progress section of the app
 */
Ext.define('SlateAdmin.controller.progress.terms.Report', {
    extend: 'SlateAdmin.controller.progress.AbstractReportController',


    // controller config
    moduleRoute: 'progress/terms/report',
    editorFormXtype: 'progress-terms-editorform',
    moduleStoreIdPrefix: 'progress.terms',

    views: [
        'progress.terms.Manager'
    ],

    stores: [
        'Terms@Slate.store',
        'progress.terms.Sections',
        'progress.terms.Students',
        'progress.terms.Reports'
    ],

    models: [
        'course.SectionTermData'
    ],

    refs: {
        progressNavPanel: 'progress-navpanel',

        managerCt: {
            selector: 'progress-terms-manager',
            autoCreate: true,

            xtype: 'progress-terms-manager'
        },
        myClassesOnlyCheckbox: 'progress-terms-sectionsgrid checkboxfield[name=myClassesOnly]',
        termSelector: 'progress-terms-sectionsgrid #termSelector',
        sectionsGrid: 'progress-terms-sectionsgrid',
        studentsGrid: 'progress-terms-studentsgrid',
        editorForm: 'progress-terms-editorform',
        revertChangesBtn: 'progress-terms-editorform button#revertChangesBtn',
        deleteBtn: 'progress-terms-editorform button#deleteBtn',
        saveDraftBtn: 'progress-terms-editorform button#saveDraftBtn',
        saveFinishedBtn: 'progress-terms-editorform button#saveFinishedBtn',
        sectionNotesForm: 'progress-terms-manager progress-sectionnotesform',
        sectionNotesRevertBtn: 'progress-terms-manager progress-sectionnotesform button#revertBtn',
        sectionNotesSaveBtn: 'progress-terms-manager progress-sectionnotesform button#saveBtn'
    },

    routes: {
        'progress/terms/report': 'showManager'
    },

    listen: {
        store: {
            '#progress.terms.Sections': {
                load: 'onSectionsStoreLoad'
            },
            '#progress.terms.Students': {
                load: 'onStudentsStoreLoad'
            }
        }
    }
});
