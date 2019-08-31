Ext.define('SlateAdmin.controller.settings.GlobalRecipients', {
    extend: 'Ext.app.Controller',

    // controller config
    views: [
        'settings.globalrecipients.Manager'
    ],

    stores: [
        'people.GlobalRecipients@Slate.store'
    ],

    models: [
        'person.GlobalRecipient@Slate.model'
    ],

    routes: {
        'settings/global-recipients': 'showManager'
    },

    refs: {
        settingsNavPanel: 'settings-navpanel',

        manager: {
            selector: 'globalrecipients-manager',
            autoCreate: true,

            xtype: 'globalrecipients-manager'
        }
    },


    control: {
        'globalrecipients-manager': {
            show: 'onManagerShow',
            beforeedit: 'onCellEditorBeforeEdit',
            edit: 'onCellEditorEdit',
            viewclick: 'onViewClick',
            deleteclick: 'onDeleteClick'
        },
        'globalrecipients-manager button[action=create]': {
            click: 'onCreateClick'
        }
    },


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        Ext.util.History.suspendState();
        navPanel.setActiveLink('settings/global-recipients');
        navPanel.expand();
        Ext.util.History.resumeState(false); // false to discard any changes to state

        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        var store = this.getPeopleGlobalRecipientsStore();

        if (!store.isLoaded()) {
            managerPanel.setLoading('Loading global recipients&hellip;');
            store.load({
                callback: function() {
                    managerPanel.setLoading(false);
                }
            });
        }

        Ext.util.History.pushState('settings/global-recipients', 'Global Recipients &mdash; Settings');
    },

    onCreateClick: function() {
        var me = this,
            globalRecipient = me.getPeopleGlobalRecipientsStore().insert(0, {})[0];

        this.getManager().getPlugin('cellediting').startEdit(globalRecipient, 0);
    },

    onCellEditorBeforeEdit: function(editor, context) {
        if (context.field != 'PersonID') {
            return;
        }

        // pre-load combo store with selected person
        var personData = context.record.get('Person');
        if (personData) {
            context.column.getEditor().getStore().loadRawData([personData]);
        }
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
        grid.setSelection(record);

        Ext.Msg.confirm('Deleting Global Recipient', 'Are you sure you want to delete this global recipient?', function(btn) {
            if (btn == 'yes') {
                record.erase();
            }
        });
    }
});
