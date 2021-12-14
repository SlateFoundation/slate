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
            browsecoursesclick: 'onBrowseCoursesClick',
            createchildclick: 'onCreateChildClick',
            viewclick: 'onViewClick',
            deleteclick: 'onDeleteClick'
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

    onCreateClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel(),
            record = managerPanel.getRootNode().insertChild(0, { leaf: true });

        managerPanel.getPlugin('cellediting').startEdit(record, 0);
    },

    onCreateChildClick: function(managerPanel, parentRecord) {
        var managerPanel = this.getManagerPanel(),
            cellEditing = managerPanel.getPlugin('cellediting'),
            location = parentRecord.insertChild(0, {
                ParentID: parentRecord.getId(),
                leaf: true
            });

        managerPanel.expandRecord(parentRecord, function() {
            Ext.defer(cellEditing.startEdit, 50, cellEditing, [location, 0]);
        });
    },

    onCellEditorEdit: function(editor, e) {
        var record = e.record;

        if (record.isValid()) {
            record.save();
        }
    },

    onViewClick: function(grid, record) {
        var personData = record.get('Person'),
            personId = record.get('PersonID'),
            username;

        if (!personData && !personId) {
            Ext.Msg.alert('Cannot view profile', 'No person is currently selected');
            return;
        }

        Ext.util.History.pushState(['people', 'lookup', personData.Username || '?id=' + (personData.ID || personId), 'profile']);
    },

    onDeleteClick: function(grid, record) {
        var parentRecord = record.parentNode;

        grid.setSelection(record);

        Ext.Msg.confirm('Deleting location', 'Are you sure you want to delete this location?', function(btn) {
            if (btn == 'yes') {
                record.erase({
                    success: function() {
                        parentRecord.set('leaf', 0 == parentRecord.childNodes.length);
                    }
                });
            }
        });
    },

    onBrowseCoursesClick: function(grid, record) {
        Ext.util.History.pushState(['course-sections', 'search', 'location:' + record.get('Handle')]);
    },

    onBeforeStoreLoad: function() {
        this.getManagerPanel().setLoading('Loading locations&hellip;');
    },

    onStoreLoad: function() {
        this.getManagerPanel().setLoading(false);
    }
});
