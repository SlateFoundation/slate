/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Departments', {
    extend: 'Ext.app.Controller',

    // controller config
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

    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'departments-manager',
        autoCreate: true,

        xtype: 'departments-manager'
    }],


	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'departments-manager': {
                show: me.onManagerShow,
                edit: me.onCellEditorEdit,
                browsecoursesclick: me.onBrowseCoursesClick,
                deletedepartmentclick: me.onDeleteDepartmentClick
            },
            'departments-manager button[action=create-department]': {
                click: me.onCreateDepartmentClick
            }
        });
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/departments');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        var store = Ext.getStore('courses.Departments');

        if (!store.isLoaded()) {
            managerPanel.setLoading('Loading departments&hellip;');
            store.load({
                callback: function() {
                    managerPanel.setLoading(false);
                }
            });
        }

        Ext.util.History.pushState('settings/departments', 'Departments &mdash; Settings');
    },

    onCreateDepartmentClick: function() {
        var me = this,
            manager = me.getManager();

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
                        manager.getView().focusRow(rec);
                    }
                });
            }
        });
    },

    onCellEditorEdit: function(editor, e) {
        var rec = e.record;

        if (rec.isValid()) {
            rec.save();
        }
    },

    onDeleteDepartmentClick: function(grid,rec) {
        Ext.Msg.confirm('Deleting Department', 'Are you sure you want to delete this department?', function(btn) {
            if (btn == 'yes') {
                rec.erase();
            }
        });
    },

    onBrowseCoursesClick: function(grid,rec) {
        Ext.util.History.add(['course-sections', 'search', 'department:' + rec.get('Handle')]);
    }

});
