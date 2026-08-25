/**
 * The Progress Section Interim Report Controller handles
 * managing the Section Interim Reports tab within the
 * Student Progress section of the app
 */
Ext.define('SlateAdmin.controller.progress.interims.Report', {
    extend: 'SlateAdmin.controller.progress.AbstractReportController',


    // controller config
    moduleRoute: 'progress/interims/report',
    editorFormXtype: 'progress-interims-editorform',
    moduleStoreIdPrefix: 'progress.interims',

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
        'progress/interims/report': 'showManager'
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
    }
});
