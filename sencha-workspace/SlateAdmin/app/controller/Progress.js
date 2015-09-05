/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Progress', {
    extend: 'Ext.app.Controller',

//    requires: [
//        'SlateAdmin.proxy.Records'
//    ],
    // controller config
    views: [
        'progress.NavPanel'
    ],

    routes: {
        'progress': 'showProgress'
    },

    refs: [{
        ref: 'navPanel',
        selector: 'progress-navpanel',
        autoCreate: true,

        xtype: 'progress-navpanel'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            'progress-navpanel': {
                expand: me.onNavPanelExpand
            }
        });
    },

    buildNavPanel: function() {
        return location.search.match(/\Wenablesbg(\W|$)/) && this.getNavPanel();
    },


    // route handlers
    showProgress: function() {
        var me = this,
            navPanel = me.getNavPanel();

        navPanel.setActiveLink(null);
        navPanel.expand();
    },


    // event handlers
    onNavPanelExpand: function(navPanel) {
        Ext.util.History.pushState('progress', 'Student Progress');
    },


    // controller methods
    syncState: function() {
        var path = ['progress'],
            title = 'Progress',
            activeLink = this.getNavPanel().getActiveLink();
        console.log('syncState, activeLink = ', activeLink);
        Ext.util.History.pushState(path, title);
    }
});