Ext.define('SlateAdmin.controller.settings.Groups', {
    extend: 'SlateAdmin.controller.settings.AbstractTreeManagerController',


    // controller config
    managerRoute: 'settings/groups',
    managerTitle: 'Groups — Settings',
    loadingMessage: 'Loading groups&hellip;',
    deleteConfirmTitle: 'Deleting Group',
    deleteConfirmMessage: 'Are you sure you want to delete this group?',

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
            createsubgroupclick: 'onCreateChildClick',
            deletegroupclick: 'onDeleteRecordClick'
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


    // event handlers
    onManagerPanelActivate: function() {
        this.getPeopleGroupsStore().loadIfDirty();
        this.syncManagerState();
    },

    onBrowseMembersClick: function(grid, record) {
        this.redirectTo(['people', 'search', 'group:' + record.get('Handle')]);
    },


    // controller methods
    buildNodeData: function(parentRecord) {
        return {
            Class: parentRecord
                ? 'Emergence\\People\\Groups\\Group'
                : 'Emergence\\People\\Groups\\Organization'
        };
    }
});
