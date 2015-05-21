/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Settings', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'settings.NavPanel'
    ],

    routes: {
        'settings': 'showSettings'
    },

    refs: [{
        ref: 'navPanel',
        selector: 'settings-navpanel',
        autoCreate: true,
        
        xtype: 'settings-navpanel'
    }],
    
    
	// controller template methods
    init: function() {
        var me = this;

        me.control({
            'settings-navpanel': {
                expand: me.onNavPanelExpand
            }
        });
    },

    buildNavPanel: function() {
        return this.getNavPanel();
    },


    // route handlers
    showSettings: function() {
        var me = this,
            navPanel = me.getNavPanel();

        navPanel.setActiveLink(null);
        navPanel.expand();
    },
    
    
    // event handlers
    onNavPanelExpand: function(navPanel) {
        Ext.util.History.pushState('settings', 'Settings');
    },


    // controller methods
    syncState: function() {
        var path = ['settings'],
            title = 'Settings',
            activeLink = this.getNavPanel().getActiveLink();
        console.log('syncState, activeLink = ', activeLink)
        Ext.util.History.pushState(path, title);
    }
});