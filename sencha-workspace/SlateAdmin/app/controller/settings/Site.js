/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.settings.Site', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.site.Manager'
    ],

    stores: [
    ],

    models: [
    ],

    routes: {
        'settings/site': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        manager: {
            selector: 'site-manager',
            autoCreate: true,

            xtype: 'site-manager'
        }
    },


    control: {
        'site-manager': {
            show: 'onManagerShow',
        },
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/site');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        // var store = Ext.getStore('courses.Departments');

        // if (!store.isLoaded()) {
        //     managerPanel.setLoading('Loading departments&hellip;');
        //     store.load({
        //         callback: function() {
        //             managerPanel.setLoading(false);
        //         }
        //     });
        // }

        Ext.util.History.pushState('settings/site', 'Site &mdash; Settings');
    },
});
