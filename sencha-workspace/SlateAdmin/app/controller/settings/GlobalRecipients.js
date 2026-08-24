Ext.define('SlateAdmin.controller.settings.GlobalRecipients', {
    extend: 'SlateAdmin.controller.settings.AbstractManagerController',


    // controller config
    managerRoute: 'settings/global-recipients',
    managerTitle: 'Global Recipients — Settings',
    loadingMessage: 'Loading global recipients&hellip;',
    deleteConfirmTitle: 'Deleting Global Recipient',
    deleteConfirmMessage: 'Are you sure you want to delete this global recipient?',

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
        managerPanel: {
            selector: 'globalrecipients-manager',
            autoCreate: true,

            xtype: 'globalrecipients-manager'
        }
    },

    control: {
        managerPanel: {
            show: 'onManagerShow',
            beforeedit: 'onCellEditorBeforeEdit',
            edit: 'onCellEditorEdit',
            viewclick: 'onViewClick',
            deleteclick: 'onDeleteRecordClick'
        },
        'globalrecipients-manager button[action=create]': {
            click: 'onCreateClick'
        }
    },


    // event handlers
    onManagerShow: function(managerPanel) {
        this.ensureStoreLoaded(this.getPeopleGlobalRecipientsStore(), managerPanel);
        this.syncManagerState();
    },

    onCreateClick: function() {
        var me = this,
            globalRecipient = me.getPeopleGlobalRecipientsStore().insert(0, {})[0];

        me.getManagerPanel().getPlugin('cellediting').startEdit(globalRecipient, 0);
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

    onViewClick: function(grid, record) {
        var personData = record.get('Person'),
            personId = record.get('PersonID');

        if (!personData && !personId) {
            Ext.Msg.alert('Cannot view profile', 'No person is currently selected');
            return;
        }

        this.redirectTo(['people', 'lookup', personData.Username || '?id=' + (personData.ID || personId), 'profile']);
    }
});
