Ext.define('SlateAdmin.controller.Settings', {
    extend: 'Ext.app.Controller',

    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle'
    ],


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
        // a scripted expand during this module's own route handling must not
        // clobber deeper state (e.g. #settings/locations) with the module root
        if (Ext.util.History.getToken().split('/')[0] != 'settings') {
            this.redirectTo('settings');
        }

        SlateAdmin.util.PageTitle.setTitle('Settings');
    },


    // controller methods
    syncState: function() {
        this.redirectTo('settings');
        SlateAdmin.util.PageTitle.setTitle('Settings');
    }
});
