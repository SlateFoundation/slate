/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Courses', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'settings.courses.Manager'
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

    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'courses-manager',
        autoCreate: true,

        xtype: 'courses-manager'
    }],


	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'courses-manager': {
                show: me.onManagerShow,
                edit: me.onCellEditorEdit
            },
            'courses-manager button[action=create-course]': {
                click: me.onCreateCourseClick
            }
/*
            'courses-manager button[action=create-organization]': {
                click: me.onCreateOrganizationClick
            },
            'courses-menu menuitem[action=browse-members]': {
                click: me.onBrowseMembersClick
            },
            'courses-menu menuitem[action=create-subcourse]': {
                click: me.onCreateSubcourseClick
            },
            'courses-menu menuitem[action=delete-course]': {
                click: me.onDeleteCourseClick
            }
*/
        });
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/courses');
        navPanel.expand(false);
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        var store = Ext.getStore('courses.Courses');

        if (!store.isLoaded()) {
            managerPanel.setLoading('Loading courses&hellip;');
            store.load({
                callback: function() {
                    managerPanel.setLoading(false);
                }
            });
        }

        Ext.util.History.pushState('settings/courses', 'Courses &mdash; Settings');
    },

    onCreateCourseClick: function() {
        var me = this;

    },

    onCellEditorEdit: function(editor, e) {
        var rec = e.record;

        if (rec.isValid()) {
            rec.save();
        }
    }

});
