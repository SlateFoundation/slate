Ext.define('SlateAdmin.controller.settings.Groups', {
    extend: 'Ext.app.Controller',

    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle'
    ],


    // controller config
    views: [
        'groups.Manager'
    ],

    stores: [
        'people.Groups@Slate.store'
    ],

    routes: {
        'settings/groups': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',
        managerPanel: {
            selector: 'groups-manager',
            autoCreate: true,

            xtype: 'groups-manager'
        }
    },

    control: {
        managerPanel: {
            activate: 'onManagerPanelActivate',
            edit: 'onCellEditorEdit',
            browsemembersclick: 'onBrowseMembersClick',
            createsubgroupclick: 'onCreateSubgroupClick',
            deletegroupclick: 'onDeleteClick'
        },
        'groups-manager button[action=create-organization]': {
            click: 'onCreateClick'
        }
    },

    listen: {
        store: {
            '#people.Groups': {
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

        navPanel.setActiveLink('settings/groups');
        navPanel.expand();

        me.application.getController('Viewport').loadCard(me.getManagerPanel());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerPanelActivate: function(managerPanel) {
        this.getPeopleGroupsStore().loadIfDirty();
        this.redirectTo('settings/groups');
        SlateAdmin.util.PageTitle.setTitle('Groups — Settings');
    },

    onCreateClick: function() {
        var me = this,
            managerPanel = me.getManagerPanel(),
            record = managerPanel.getRootNode().insertChild(0, {
                Class: 'Emergence\\People\\Groups\\Organization',
                leaf: true
            });

        managerPanel.getPlugin('cellediting').startEdit(record, 0);
    },

    onCreateSubgroupClick: function(managerPanel, parentRecord) {
        var cellEditing = managerPanel.getPlugin('cellediting'),
            location = parentRecord.insertChild(0, {
                Class: 'Emergence\\People\\Groups\\Group',
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


    onDeleteClick: function(grid, record) {
        var parentNode = record.parentNode;

        grid.setSelection(record);

        Ext.Msg.confirm('Deleting Group', 'Are you sure you want to delete this group?', function(btn) {
            if (btn == 'yes') {
                record.erase({
                    success: function() {
                        parentNode.set('leaf', 0 == parentNode.childNodes.length);
                    }
                });
            }
        });
    },

    onBrowseMembersClick: function(grid,rec) {
        this.redirectTo(['people', 'search', 'group:' + rec.get('Handle')]);
    },

    onBeforeStoreLoad: function() {
        this.getManagerPanel().setLoading('Loading groups&hellip;');
    },

    onStoreLoad: function() {
        this.getManagerPanel().setLoading(false);
    }
});
