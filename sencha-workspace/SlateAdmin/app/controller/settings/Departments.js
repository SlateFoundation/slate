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
                edit: me.onCellEditorEdit
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
        //var me = this;
        console.log('onCreateDepartmentClick- implement me');

    },

    onCellEditorEdit: function(editor, e) {
        var rec = e.record;

        if (rec.isValid()) {
            rec.save();
        }
    }

});
