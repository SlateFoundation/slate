/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Progress', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'progress.NavPanel'
    ],

    routes: {
        'progress': 'showProgress'
    },

    refs: {
        navPanel: {
            selector: 'progress-navpanel',
            autoCreate: true,

            xtype: 'progress-navpanel'
        }
    },


    control: {
        'progress-navpanel': {
            beforeexpand: 'onNavPanelBeforeExpand'
        }
    },

    buildNavPanel: function () {
        return this.getNavPanel();
    },


    // route handlers
    showProgress: function () {
        var me = this,
            navPanel = me.getNavPanel();

        navPanel.setActiveLink(null);
        navPanel.expand();
    },


    // event handlers
    onNavPanelBeforeExpand: function (navPanel) {
        Ext.util.History.pushState('progress', 'Student Progress');
    },


    // controller methods
    syncState: function () {
        var path = ['progress'],
            title = 'Progress',
            activeLink = this.getNavPanel().getActiveLink();

        Ext.util.History.pushState(path, title);
    }
});