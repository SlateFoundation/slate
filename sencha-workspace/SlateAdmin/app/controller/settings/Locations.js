Ext.define('SlateAdmin.controller.settings.Locations', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.locations.Manager'
    ],

    stores: [
        'Locations@Slate.store'
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
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            // viewclick: 'onViewClick',
            // deleteclick: 'onDeleteClick'
        }
        // 'locations-manager button[action=create]': {
            // click: 'onCreateClick'
        // }
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

    // onCreateClick: function() {
    //     var me = this,
    //     location = me.getLocationsStore().insert(0, {})[0];

    //     this.getManager().getPlugin('cellediting').startEdit(location, 0);
    // },

    onCellEditorEdit: function(editor, e) {
        var record = e.record;

        if (record.isValid()) {
            record.save();
        }
    },

    // onViewClick: function(grid, record) {
    //     var personData = record.get('Person'),
    //         personId = record.get('PersonID'),
    //         username;

    //     if (!personData && !personId) {
    //         Ext.Msg.alert('Cannot view profile', 'No person is currently selected');
    //         return;
    //     }

    //     Ext.util.History.pushState(['people', 'lookup', personData.Username || '?id=' + (personData.ID || personId), 'profile']);
    // },

    // onDeleteClick: function(grid, record) {
    //     grid.setSelection(record);

    //     Ext.Msg.confirm('Deleting location', 'Are you sure you want to delete this location?', function(btn) {
    //         if (btn == 'yes') {
    //             record.erase();
    //         }
    //     });
    // }

    onBeforeLocationsLoad: function() {
        this.getManagerPanel().setLoading('Loading locations&hellip;');
    },

    onLocationsLoad: function() {
        this.getManagerPanel().setLoading(false);
    }
});
