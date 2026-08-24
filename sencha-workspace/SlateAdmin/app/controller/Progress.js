Ext.define('SlateAdmin.controller.Progress', {
    extend: 'Ext.app.Controller',

    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle'
    ],

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
        // a scripted expand during this module's own route handling must not
        // clobber deeper state (e.g. #progress/interims/report) with the module root
        if (Ext.util.History.getToken().split('/')[0] != 'progress') {
            this.redirectTo('progress');
        }

        SlateAdmin.util.PageTitle.setTitle('Student Progress');
    },


    // controller methods
    syncState: function () {
        this.redirectTo('progress');
        SlateAdmin.util.PageTitle.setTitle('Progress');
    }
});