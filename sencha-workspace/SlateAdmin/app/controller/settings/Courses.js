Ext.define('SlateAdmin.controller.settings.Courses', {
    extend: 'SlateAdmin.controller.settings.AbstractManagerController',


    // controller config
    managerRoute: 'settings/courses',
    managerTitle: 'Courses — Settings',
    loadingMessage: 'Loading courses&hellip;',
    deleteConfirmTitle: 'Deleting Course',
    deleteConfirmMessage: 'Are you sure you want to delete this course?',

    views: [
        'settings.courses.Manager',
        'settings.courses.Form'
    ],

    stores: [
        'courses.Courses'
    ],

    models: [
        'course.Course'
    ],

    routes: {
        'settings/courses': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        managerPanel: {
            selector: 'courses-manager',
            autoCreate: true,

            xtype: 'courses-manager'
        },
        coursesFormWindow: {
            selector: 'courses-form-window',
            autoCreate: true,

            xtype: 'courses-form-window'
        }
    },

    control: {
        managerPanel: {
            show: 'onManagerShow',
            edit: 'onCellEditorEdit',
            browsecoursesclick: 'onBrowseCoursesClick',
            deletecourseclick: 'onDeleteRecordClick'
        },
        'courses-manager button[action=create-course]': {
            click: 'onCreateCourseClick'
        },
        'courses-form-window button[action="save"]': {
            click: 'onSaveCourseClick'
        },
        'courses-form-window form': {
            fieldvaliditychange: 'setFormValidity',
            fielderrorchange: 'setFormValidity'
        }
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        this.ensureStoreLoaded(this.getCoursesCoursesStore(), managerPanel);
        this.syncManagerState();
    },

    onCreateCourseClick: function() {
        var me = this,
            win = me.getCoursesFormWindow(),
            form = win.down('form'),
            titleField = form.down('textfield[name="Title"]'),
            saveButton = win.down('button[action="save"]');

        form.suspendEvents();
        form.reset();
        form.resumeEvents();

        saveButton.disable();

        win.show(null, function() {
            titleField.focus();
        });
    },

    onSaveCourseClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel(),
            win = me.getCoursesFormWindow(),
            form = win.down('form'),
            course = me.getCourseCourseModel().create(form.getValues());

        if (course.isValid()) {
            course.set('ID', null);

            course.save({
                success: function(rec) {
                    win.close();
                    me.getCoursesCoursesStore().add(course);
                    managerPanel.getView().focusRow(rec);
                }
            });
        }
    },

    onBrowseCoursesClick: function(grid, record) {
        this.redirectTo(['course-sections', 'search', 'course:' + record.get('Code')]);
    },


    // controller methods
    setFormValidity: function(form) {
        var saveButton = form.up('window').down('button[action="save"]');

        if (form.isValid()) {
            saveButton.enable();
        } else {
            saveButton.disable();
        }
    }
});
