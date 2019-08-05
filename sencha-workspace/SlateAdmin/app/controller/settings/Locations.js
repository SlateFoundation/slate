Ext.define('SlateAdmin.controller.settings.Locations', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.locations.Manager'
    ],

    stores: [
        'Locations@Slate.store',
        'LocationsTree@Slate.store'
    ],

    models: [
        'Location@Slate.model'
    ],

    routes: {
        'settings/locations': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',

        managerPanel: {
            selector: 'locations-manager',
            autoCreate: true,

            xtype: 'locations-manager'
        }
    },


    control: {
        managerPanel: {
            activate: 'onManagerPanelActivate'
        }
    },

    listen: {
        store: {
            '#Locations': {
                beforeload: 'onBeforeLocationsLoad',
                load: 'onLocationsLoad'
            }
        }
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/locations');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManagerPanel());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerPanelActivate: function() {
        this.getLocationsStore().loadIfDirty();

        Ext.util.History.pushState('settings/locations', 'Locations &mdash; Settings');
    },

    onBeforeLocationsLoad: function() {
        this.getManagerPanel().setLoading('Loading locations&hellip;');
    },

    onLocationsLoad: function() {
        this.getManagerPanel().setLoading(false);
    }
});
