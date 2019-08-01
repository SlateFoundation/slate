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

    refs: {
        navPanel: {
            selector: 'settings-navpanel',
            autoCreate: true,

            xtype: 'settings-navpanel'
        }
    },


    control: {
        'settings-navpanel': {
            beforeexpand: 'onNavPanelBeforeExpand'
        }
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
    onNavPanelBeforeExpand: function(navPanel) {
        Ext.util.History.pushState('settings', 'Settings');
    },


    // controller methods
    syncState: function() {
        var path = ['settings'],
            title = 'Settings',
            activeLink = this.getNavPanel().getActiveLink();
        Ext.util.History.pushState(path, title);
    }
});
