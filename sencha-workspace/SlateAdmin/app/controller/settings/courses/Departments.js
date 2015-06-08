/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.courses.Departments', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'settings.courses.departments.Manager',
        'settings.courses.departments.Menu'
    ],
    
    stores: [
        'settings.courses.Departments'
    ],
    
    routes: {
        'settings/departments': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'settings-courses-departments-manager',
        autoCreate: true,
        
        xtype: 'settings-courses-departments-manager'
    },{
        ref: 'menu',
        selector: 'settings-courses-departments-menu',
        autoCreate: true,
        
        xtype: 'settings-courses-departments-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;
        
        me.control({
            'settings-courses-departments-manager': {
                show: me.onManagerShow
            },
            'settings-courses-departments-manager button[action=create-department]': {
                click: me.onCreateDepartmentClick
            },
            'settings-courses-departments-menu menuitem[action=delete-department]': {
                click: me.onDeleteDepartmentClick
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

        me.application.loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var store = Ext.getStore('settings.courses.Departments');
        
        if (!store.isLoaded() && !store.isLoading()) {
            store.load();
        }

        Ext.util.History.pushState('settings/departments', 'Course Department &mdash; Settings');
    },

    onCreateDepartmentClick: function() {
        var store = Ext.getStore('settings.courses.Departments');
            departmentGrid = this.getManager(),
            phantomDepartment = store.insert(0, [{
                Title: '',
                Status: 'Live'
            }])[0];

        departmentGrid.getPlugin('courseDepartmentEditing').startEdit(phantomDepartment, 0);
    },


    onDeleteDepartmentClick: function() {
        var me = this,
            node = me.getMenu().getRecord(),
            parentNode = node.parentNode;

        Ext.Msg.confirm('Deleting status', 'Are you sure you want to delete this status?', function(btn) {
            if (btn == 'yes') {
                node.destroy();
            }
        });
    }
});