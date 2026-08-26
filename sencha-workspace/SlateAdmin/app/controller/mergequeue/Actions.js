/**
 * mergequeue.Actions controller
 *
 * ## Responsibilities
 * - Route and load the follow-up actions queue (status filter)
 * - Execute an action in place where an executor is registered (POST
 *   .../execute), behind a confirm dialog restating the action
 * - Record manual outcomes (complete/skip) with required notes (PATCH)
 *
 * Shares the merge-queue nav panel owned by
 * {@link SlateAdmin.controller.MergeQueue}, mirroring how the settings
 * module's sub-controllers share `settings-navpanel`.
 *
 * @see specs/api/person-merge.md
 */
Ext.define('SlateAdmin.controller.mergequeue.Actions', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Ext.window.Toast',

        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle',

        /* global Slate */
        'Slate.API'
    ],

    // controller config
    views: [
        'mergequeue.ActionsManager'
    ],

    models: [
        'mergequeue.FollowUpAction'
    ],

    stores: [
        'mergequeue.FollowUpActions'
    ],

    routes: {
        'merge-queue/actions': 'showActions',
        'merge-queue/actions/:status': {
            action: 'showActions',
            conditions: {
                ':status': '([^/]+)'
            }
        }
    },

    refs: {
        mergequeueNavPanel: 'mergequeue-navpanel',
        manager: {
            selector: 'mergequeue-actions-grid',
            autoCreate: true,

            xtype: 'mergequeue-actions-grid'
        },
        statusField: 'mergequeue-actions-grid #statusField'
    },

    control: {
        manager: {
            'executeclick': 'onExecuteClick',
            'completeclick': 'onCompleteClick',
            'skipclick': 'onSkipClick'
        },
        statusField: {
            select: 'onStatusSelect'
        }
    },

    // route handlers

    /**
     * Route handler for merge-queue/actions[/:status]
     * @param {String} status pending|completed|skipped|failed|all -- default pending
     * @return {void}
     */
    showActions: function(status) {
        var me = this,
            store = me.getMergequeueFollowUpActionsStore(),
            proxy = store.getProxy(),
            navPanel = me.getMergequeueNavPanel();

        status = status || 'pending';

        Ext.suspendLayouts();

        proxy.setExtraParam('status', status);

        navPanel.setActiveLink('merge-queue/actions');
        navPanel.expand();

        me.application.getController('Viewport').loadCard(me.getManager());

        // statusField lives inside the manager grid -- only reachable once
        // loadCard (just above) has constructed it via the autoCreate
        // getManager() call (see MergeQueue.showCandidates for the same fix)
        me.getStatusField().setValue(status);

        Ext.resumeLayouts(true);

        SlateAdmin.util.PageTitle.setTitle('Follow-up Actions');

        store.loadIfDirty();
    },

    // event handlers
    onStatusSelect: function(field, records) {
        var value = records && records.length ? records[0].get('value') : 'pending';

        this.redirectTo(['merge-queue', 'actions', value]);
    },

    onExecuteClick: function(grid, record) {
        var me = this;

        Ext.Msg.confirm(
            'Run executor',
            'Run the ' + Ext.util.Format.htmlEncode(record.get('Connector')) + ' executor for ' +
                '<strong>' + Ext.util.Format.htmlEncode(record.get('Type')) + '</strong>?',
            function(btn) {
                if (btn === 'yes') {
                    me.executeAction(grid, record);
                }
            }
        );
    },

    onCompleteClick: function(grid, record) {
        this.promptOutcome(grid, record, 'completed', 'Mark action complete', 'What was done?');
    },

    onSkipClick: function(grid, record) {
        this.promptOutcome(grid, record, 'skipped', 'Skip action', 'Why is this being skipped?');
    },


    // controller methods
    // @private
    executeAction: function(grid, record) {
        var me = this;

        grid.setLoading('Running executor&hellip;');

        Slate.API.request({
            url: '/people/merge/actions/' + record.getId() + '/execute',
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            success: function(response) {
                grid.setLoading(false);
                me.applyActionUpdate(grid, record, response.data.data);
            },
            failure: function(response) {
                grid.setLoading(false);
                Ext.Msg.alert('Executor failed', Ext.util.Format.htmlEncode(me.responseMessage(response)));
            }
        });
    },

    // @private
    promptOutcome: function(grid, record, status, title, promptLabel) {
        var me = this;

        Ext.Msg.show({
            title: title,
            msg: promptLabel,
            prompt: true,
            multiline: 60,
            buttons: Ext.Msg.OKCANCEL,
            fn: function(btn, notes) {
                if (btn !== 'ok') {
                    return;
                }

                if (!notes || !notes.trim()) {
                    Ext.Msg.alert('Notes required', 'Please enter a note to record this outcome.');
                    return;
                }

                me.recordOutcome(grid, record, status, notes.trim());
            }
        });
    },

    // @private
    recordOutcome: function(grid, record, status, notes) {
        var me = this;

        grid.setLoading(true);

        Slate.API.request({
            url: '/people/merge/actions/' + record.getId(),
            method: 'PATCH',
            headers: {
                Accept: 'application/json'
            },
            jsonData: {
                status: status,
                notes: notes
            },
            success: function(response) {
                grid.setLoading(false);
                me.applyActionUpdate(grid, record, response.data.data);
            },
            failure: function(response) {
                grid.setLoading(false);
                Ext.Msg.alert('Could not record outcome', Ext.util.Format.htmlEncode(me.responseMessage(response)));
            }
        });
    },

    /**
     * Update the action row in place (never a full reload) and drop it
     * from the queue if it no longer matches the active status filter
     * @param {Ext.grid.Panel} grid
     * @param {SlateAdmin.model.mergequeue.FollowUpAction} record
     * @param {Object} updatedFields
     * @return {void}
     */
    applyActionUpdate: function(grid, record, updatedFields) {
        var store = grid.getStore(),
            filterStatus = store.getProxy().extraParams.status;

        record.set(updatedFields || {}, { dirty: false });

        Ext.toast('Action ' + record.get('Status'));

        if (filterStatus !== 'all' && record.get('Status') !== filterStatus) {
            store.remove(record);
        }
    },

    // @private
    responseMessage: function(response) {
        return (response && response.data && response.data.message) ||
            'Please try again. If this problem persists, contact support.';
    }
});
