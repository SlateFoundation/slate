/**
 * Shared skeleton for the settings-module manager controllers: the
 * card-loading route handler, URL/title state sync, store loading masks,
 * inline cell-edit saves, and confirm-then-erase deletes.
 *
 * Subclasses declare their own routes/refs/control/listen — the six
 * managers differ in stores, semantic event names, and creation flows —
 * and set the contract properties below. The ref for the manager card
 * must be named `managerPanel` (the base's handlers resolve it via
 * getManagerPanel()).
 */
Ext.define('SlateAdmin.controller.settings.AbstractManagerController', {
    extend: 'Ext.app.Controller',

    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle'
    ],


    // subclass contract
    managerRoute: null,
    managerTitle: null,
    loadingMessage: 'Loading&hellip;',
    deleteConfirmTitle: 'Deleting record',
    deleteConfirmMessage: 'Are you sure you want to delete this record?',


    // route handlers
    showManager: function() {
        var me = this,
            navPanel = me.getSettingsNavPanel();

        Ext.suspendLayouts();

        navPanel.setActiveLink(me.managerRoute);
        navPanel.expand();

        me.application.getController('Viewport').loadCard(me.getManagerPanel());

        Ext.resumeLayouts(true);
    },


    // event handlers
    onCellEditorEdit: function(editor, e) {
        var record = e.record;

        if (record.isValid()) {
            record.save();
        }
    },

    onDeleteRecordClick: function(grid, record) {
        var me = this;

        grid.setSelection(record);

        Ext.Msg.confirm(me.deleteConfirmTitle, me.deleteConfirmMessage, function(btn) {
            if (btn == 'yes') {
                record.erase();
            }
        });
    },

    onBeforeStoreLoad: function() {
        this.getManagerPanel().setLoading(this.loadingMessage);
    },

    onStoreLoad: function() {
        this.getManagerPanel().setLoading(false);
    },


    // controller methods

    /**
     * Push this manager's canonical route + document title; call from the
     * card's activate/show handler so direct activations sync the URL
     * (a no-op when the token already matches, e.g. on route-driven entry)
     */
    syncManagerState: function() {
        this.redirectTo(this.managerRoute);
        SlateAdmin.util.PageTitle.setTitle(this.managerTitle);
    },

    /**
     * One-shot masked load for managers without dirty-tracked stores
     */
    ensureStoreLoaded: function(store, managerPanel) {
        if (!store.isLoaded()) {
            managerPanel.setLoading(this.loadingMessage);
            store.load({
                callback: function() {
                    managerPanel.setLoading(false);
                }
            });
        }
    }
});
