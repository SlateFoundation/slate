/**
 * Controls the unclosable activity tab in the main tab panel
 *
 * Responsibilities:
 * - Handle `#activity` route and switch to activity tab
 * - Create and manage ActivityStream store
 * - Load ActivityStream store when activity tab is activated
 * - Load ActivityStream store when refresh/load-all buttons are clicked
 */
Ext.define('EmergenceEditor.controller.Activity', {
    extend: 'Ext.app.Controller',


    // controller config
    stores: [
        'ActivityStream'
    ],

    routes: {
        'activity': 'showActivity'
    },

    refs: {
        tabPanel: 'emergence-tabpanel',
        activityPanel: 'emergence-tab-activity'
    },

    control: {
        activityPanel: {
            activate: 'onActivityPanelActivate'
        },
        'emergence-tab-activity button[action=refresh]': {
            click: 'onRefreshClick'
        },
        'emergence-tab-activity button[action=load-all]': {
            click: 'onLoadAllClick'
        }
    },


    // route handlers
    showActivity: function() {
        this.getTabPanel().setActiveTab(this.getActivityPanel());
    },


    // event handlers
    onActivityPanelActivate: function() {
        var store = this.getActivityStreamStore();

        if (!store.isLoaded() && !store.isLoading()) {
            store.load();
        }
    },

    onRefreshClick: function() {
        this.getActivityStreamStore().load();
    },

    onLoadAllClick: function() {
        this.getActivityStreamStore().load({
            url: '/editor/activity/all'
        });
    }
});