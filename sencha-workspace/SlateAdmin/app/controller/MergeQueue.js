/**
 * MergeQueue controller
 *
 * ## Responsibilities
 * - Own the merge-queue nav panel and the duplicate-candidates card
 * - Route the candidates queue (status filter + optional selected pair)
 * - Keep the URL in sync with the queue's status filter and selection
 *
 * The compare view's own decision actions (merge/dismiss/defer) are handled
 * by {@link SlateAdmin.controller.mergequeue.Compare}; the follow-up
 * actions queue by {@link SlateAdmin.controller.mergequeue.Actions} -- both
 * share this controller's nav panel, mirroring how the settings module's
 * sub-controllers share `settings-navpanel`.
 */
Ext.define('SlateAdmin.controller.MergeQueue', {
    extend: 'Ext.app.Controller',
    requires: [
        /* globals SlateAdmin */
        'SlateAdmin.util.PageTitle'
    ],

    // controller config
    views: [
        'mergequeue.NavPanel',
        'mergequeue.Manager'
    ],

    models: [
        'mergequeue.Candidate'
    ],

    stores: [
        'mergequeue.Candidates'
    ],

    routes: {
        'merge-queue': 'showCandidates',
        'merge-queue/candidates': 'showCandidates',
        'merge-queue/candidates/:status': {
            action: 'showCandidates',
            conditions: {
                ':status': '([^/]+)'
            }
        },
        'merge-queue/candidates/:status/:candidateID': {
            action: 'showCandidates',
            conditions: {
                ':status': '([^/]+)',
                ':candidateID': '([^/]+)'
            }
        }
    },

    refs: {
        navPanel: {
            selector: 'mergequeue-navpanel',
            autoCreate: true,

            xtype: 'mergequeue-navpanel'
        },
        manager: {
            selector: 'mergequeue-manager',
            autoCreate: true,

            xtype: 'mergequeue-manager'
        },
        grid: 'mergequeue-candidates-grid',
        statusField: 'mergequeue-candidates-grid #statusField'
    },

    control: {
        navPanel: {
            beforeexpand: 'onNavPanelBeforeExpand'
        },
        manager: {
            activate: 'onManagerActivate',
            selectedcandidatechange: 'onSelectedCandidateChange'
        },
        grid: {
            select: { fn: 'onCandidateSelect', buffer: 10 },
            deselect: { fn: 'onCandidateDeselect', buffer: 10 }
        },
        statusField: {
            select: 'onStatusSelect'
        }
    },


    /**
     * Called by SlateAdmin.controller.Viewport to collect this module's
     * navigation panel
     * @return {SlateAdmin.view.mergequeue.NavPanel}
     */
    buildNavPanel: function() {
        return this.getNavPanel();
    },

    // route handlers

    /**
     * Route handler for merge-queue[/candidates[/:status[/:candidateID]]]
     * @param {String} status open|merged|dismissed|deferred|all -- default open
     * @param {String} candidateID The candidate pair to select, if any
     * @return {void}
     */
    showCandidates: function(status, candidateID) {
        var me = this,
            store = me.getMergequeueCandidatesStore(),
            proxy = store.getProxy();

        status = status || 'open';

        me.suspendStateSync();
        Ext.suspendLayouts();

        proxy.setExtraParam('status', status);
        me.getStatusField().setValue(status);

        me.getNavPanel().setActiveLink('merge-queue');
        me.getNavPanel().expand();
        me.application.getController('Viewport').loadCard(me.getManager());

        Ext.resumeLayouts(true);

        SlateAdmin.util.PageTitle.setTitle('Duplicate Candidates');

        store.loadIfDirty(function() {
            me.selectCandidate(candidateID, function() {
                me.resumeStateSync();
            });
        });
    },

    // event handlers

    /**
     * Event handler. Syncs state when the nav panel expands -- but a
     * scripted expand during the sibling mergequeue.Actions controller's
     * own route handling must not clobber its URL with the candidates
     * queue root (see SlateAdmin.controller.Settings for the same caveat)
     * @return {void}
     */
    onNavPanelBeforeExpand: function() {
        if (Ext.util.History.getToken().indexOf('merge-queue/actions') === 0) {
            return;
        }

        this.syncState();
    },

    onManagerActivate: function() {
        this.getMergequeueCandidatesStore().loadIfDirty();
    },

    /**
     * Event handler. Syncs state when the selected candidate changes
     * @return {void}
     */
    onSelectedCandidateChange: function() {
        this.syncState();
    },

    onCandidateSelect: function(selModel, candidateRecord) {
        Ext.suspendLayouts();

        if (selModel.getCount() === 1) {
            this.getManager().setSelectedCandidate(candidateRecord);
        }

        Ext.resumeLayouts(true);
    },

    onCandidateDeselect: function(selModel) {
        Ext.suspendLayouts();

        if (selModel.getCount() === 0) {
            this.getManager().setSelectedCandidate(null);
        }

        Ext.resumeLayouts(true);
    },

    onStatusSelect: function(field, records) {
        var value = records && records.length ? records[0].get('value') : 'open';

        this.redirectTo(['merge-queue', 'candidates', value]);
    },

    // controller-local replacement for the retired Ext.util.History
    // suspend/flush counter -- see SlateAdmin.controller.People for the
    // canonical explanation
    stateSyncSuspended: 0,

    suspendStateSync: function() {
        this.stateSyncSuspended++;
    },

    resumeStateSync: function(flush) {
        var me = this;

        if (me.stateSyncSuspended && !--me.stateSyncSuspended) {
            if (flush !== false && me.stateSyncPending) {
                me.syncState();
            }

            me.stateSyncPending = false;
        }
    },

    // controller methods

    /**
     * Select a candidate pair by ID (loading it directly if it isn't in
     * the currently-loaded page) or clear the selection
     * @param {String} candidateID
     * @param {Function} callback
     * @return {void}
     */
    selectCandidate: function(candidateID, callback) {
        var me = this,
            store = me.getMergequeueCandidatesStore(),
            record;

        if (!candidateID) {
            me.finishSelectCandidate(null, callback);
            return;
        }

        record = store.getById(parseInt(candidateID, 10));

        if (record) {
            me.finishSelectCandidate(record, callback);
            return;
        }

        me.getMergequeueCandidateModel().load(candidateID, {
            success: function(loadedRecord) {
                me.finishSelectCandidate(loadedRecord, callback);
            },
            failure: function() {
                Ext.Msg.alert('Not found', 'Could not find the requested candidate pair');
                me.finishSelectCandidate(null, callback);
            }
        });
    },

    /**
     * Advance the grid's selection to whichever row now occupies the given
     * index (a row was just removed, or updated in place) -- used after a
     * decision to move the operator on to the next open pair
     * @param {Number} previousIndex
     * @return {void}
     */
    advanceSelection: function(previousIndex) {
        var store = this.getMergequeueCandidatesStore(),
            nextIndex = Math.min(previousIndex, store.getCount() - 1),
            nextRecord = nextIndex >= 0 ? store.getAt(nextIndex) : null;

        this.finishSelectCandidate(nextRecord);
    },

    // @private
    finishSelectCandidate: function(record, callback) {
        var me = this,
            selModel = me.getGrid().getSelectionModel();

        if (record) {
            selModel.select(record, false, true);
        } else {
            selModel.deselectAll(true);
        }

        me.getManager().setSelectedCandidate(record);
        me.syncState();
        Ext.callback(callback, me);
    },

    /**
     * Sets the title and path (url) based on the queue's status filter and
     * the selected candidate pair
     * @return {void}
     */
    syncState: function() {
        var me = this,
            candidate = me.getManager().getSelectedCandidate(),
            status = me.getMergequeueCandidatesStore().getProxy().extraParams.status || 'open',
            path = ['merge-queue', 'candidates', status];

        if (me.stateSyncSuspended) {
            me.stateSyncPending = true;
            return;
        }

        me.stateSyncPending = false;

        if (candidate) {
            path.push(candidate.getId());
        }

        me.redirectTo(path);
        SlateAdmin.util.PageTitle.setTitle('Duplicate Candidates');
    }
});
