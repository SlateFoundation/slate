Ext.define('SlateAdmin.controller.settings.Locations', {
    extend: 'SlateAdmin.controller.settings.AbstractTreeManagerController',


    // controller config
    managerRoute: 'settings/locations',
    managerTitle: 'Locations — Settings',
    loadingMessage: 'Loading locations&hellip;',
    deleteConfirmTitle: 'Deleting location',
    deleteConfirmMessage: 'Are you sure you want to delete this location?',

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
            browsecoursesclick: 'onBrowseCoursesClick',
            createchildclick: 'onCreateChildClick',
            viewclick: 'onViewClick',
            deleteclick: 'onDeleteRecordClick'
        },
        'locations-manager button[action=create]': {
            click: 'onCreateClick'
        }
    },

    listen: {
        store: {
            '#Locations': {
                beforeload: 'onBeforeStoreLoad',
                load: 'onStoreLoad'
            }
        }
    },


    // event handlers
    onManagerPanelActivate: function() {
        this.getLocationsStore().loadIfDirty();
        this.syncManagerState();
    },

    onViewClick: function(grid, record) {
        var personData = record.get('Person'),
            personId = record.get('PersonID');

        if (!personData && !personId) {
            Ext.Msg.alert('Cannot view profile', 'No person is currently selected');
            return;
        }

        this.redirectTo(['people', 'lookup', personData.Username || '?id=' + (personData.ID || personId), 'profile']);
    },

    onBrowseCoursesClick: function(grid, record) {
        this.redirectTo(['course-sections', 'search', 'location:' + record.get('Handle')]);
    }
});
