Ext.define('SlateAdmin.controller.settings.Departments', {
    extend: 'SlateAdmin.controller.settings.AbstractManagerController',


    // controller config
    managerRoute: 'settings/departments',
    managerTitle: 'Departments — Settings',
    loadingMessage: 'Loading departments&hellip;',
    deleteConfirmTitle: 'Deleting Department',
    deleteConfirmMessage: 'Are you sure you want to delete this department?',

    views: [
        'settings.departments.Manager'
    ],

    stores: [
        'courses.Departments'
    ],

    models: [
        'course.Department'
    ],

    routes: {
        'settings/departments': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        managerPanel: {
            selector: 'departments-manager',
            autoCreate: true,

            xtype: 'departments-manager'
        }
    },

    control: {
        managerPanel: {
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            browsecoursesclick: 'onBrowseCoursesClick',
            deletedepartmentclick: 'onDeleteRecordClick'
        },
        'departments-manager button[action=create-department]': {
            click: 'onCreateDepartmentClick'
        }
    },


    // event handlers
    onManagerPanelActivate: function(managerPanel) {
        this.ensureStoreLoaded(this.getCoursesDepartmentsStore(), managerPanel);
        this.syncManagerState();
    },

    onCreateDepartmentClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel();

        Ext.Msg.prompt('Create Department', 'Enter a name for the new department:', function(btn, text) {
            var department;

            text = Ext.String.trim(text);

            if (btn == 'ok' && text) {
                department = me.getCourseDepartmentModel().create({
                    Title: text,
                    Class: 'Slate\\Courses\\Department'
                });

                department.save({
                    success: function(rec) {
                        me.getCoursesDepartmentsStore().add(department);
                        managerPanel.getView().focusRow(rec);
                    }
                });
            }
        });
    },

    onBrowseCoursesClick: function(grid, record) {
        this.redirectTo(['course-sections', 'search', 'department:' + record.get('Handle')]);
    }
});
