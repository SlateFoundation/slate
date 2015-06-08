/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.courses.Courses', {
    extend: 'Ext.app.Controller',
    
    
    // controller config
    views: [
        'settings.courses.Manager',
        'settings.courses.Menu'
    ],
    
    stores: [
        'settings.courses.Courses'
    ],
    
    routes: {
        'settings/courses': 'showManager'
    },
    
    refs: [{
        ref: 'settingsNavPanel',
        selector: 'settings-navpanel'
    },{
        ref: 'manager',
        selector: 'settings-courses-manager',
        autoCreate: true,
        
        xtype: 'settings-courses-manager'
    },{
        ref: 'menu',
        selector: 'settings-courses-menu',
        autoCreate: true,
        
        xtype: 'settings-courses-menu'
    }],
    
	
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'settings-courses-manager': {
                show: me.onManagerShow,
                itemcontextmenu: me.onCourseContextMenu
            },
            'settings-courses-manager button[action=create-course]': {
                click: me.onCreateCourseClick
            },
            'settings-courses-menu menuitem[action=delete-course]': {
                click: me.onDeleteCourseClick
            }
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

        me.application.loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },
    
    
    // event handlers
    onManagerShow: function(managerPanel) {
        var store = Ext.getStore('settings.courses.Courses');
        
        if (!store.isLoaded() && !store.isLoading()) {
            store.load();
        }

        Ext.util.History.pushState('settings/courses', 'Courses &mdash; Settings');
    },

    onCourseContextMenu: function(tree, record, item, index, ev) {
        ev.stopEvent();

        var menu = this.getMenu();

        menu.setRecord(record);
        menu.showAt(ev.getXY());
    },

    onCreateCourseClick: function() {
        var store = Ext.getStore('settings.courses.Courses');
            courseGrid = this.getManager(),
            phantomCourse = store.insert(0, [{
                Title: '',
                Status: 'Live'
            }])[0];

        courseGrid.getPlugin('courseEditing').startEdit(phantomCourse, 0);
    },


    onDeleteCourseClick: function() {
        var me = this,
            node = me.getMenu().getRecord(),
            parentNode = node.parentNode;

        Ext.Msg.confirm('Deleting course', 'Are you sure you want to delete this course?', function(btn) {
            if (btn == 'yes') {
                node.destroy();
            }
        });
    }
});