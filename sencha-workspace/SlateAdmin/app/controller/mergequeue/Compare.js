/**
 * mergequeue.Compare controller
 *
 * ## Responsibilities
 * - Load GET /people/merge/preview whenever the compare view's selected
 *   candidate or merge direction changes
 * - Carry out the compare view's decision actions: merge (POST
 *   /people/merge), dismiss/defer (PATCH .../candidates/<id>) -- each
 *   behind a confirm dialog restating what will happen
 * - After a decision, update the queue in place (no reload) and advance
 *   the selection to the next candidate pair (see MergeQueue controller)
 *
 * @see specs/api/person-merge.md
 */
Ext.define('SlateAdmin.controller.mergequeue.Compare', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',
        'Ext.window.Toast',

        /* global Slate */
        'Slate.API'
    ],

    // controller config
    refs: {
        compareCt: 'mergequeue-compare'
    },

    control: {
        compareCt: {
            candidatechange: 'onCandidateChange'
        },
        'mergequeue-compare button[action=flip-direction]': {
            click: 'onFlipDirectionClick'
        },
        'mergequeue-compare button[action=merge-candidate]': {
            click: 'onMergeCandidateClick'
        },
        'mergequeue-compare button[action=dismiss-candidate]': {
            click: 'onDismissCandidateClick'
        },
        'mergequeue-compare button[action=defer-candidate]': {
            click: 'onDeferCandidateClick'
        }
    },


    // event handlers
    onCandidateChange: function(compareCt, candidate) {
        this.loadPreview(compareCt, candidate);
    },

    onFlipDirectionClick: function() {
        var compareCt = this.getCompareCt();

        compareCt.setReversed(!compareCt.getReversed());
        this.loadPreview(compareCt, compareCt.getCandidate());
    },

    onMergeCandidateClick: function() {
        var me = this,
            compareCt = me.getCompareCt(),
            candidate = compareCt.getCandidate(),
            previewData = compareCt.getPreviewData();

        if (!candidate || !previewData) {
            return;
        }

        Ext.Msg.confirm(
            'Confirm merge',
            'Merge <strong>' + Ext.util.Format.htmlEncode(me.personLabel(previewData.source)) + '</strong> into ' +
                '<strong>' + Ext.util.Format.htmlEncode(me.personLabel(previewData.target)) + '</strong>?<br><br>' +
                Ext.util.Format.htmlEncode(me.buildImpactSummary(previewData.impact)) +
                '<br><br>The source record will be disabled and retired, never deleted.',
            function(btn) {
                if (btn === 'yes') {
                    me.executeMerge(compareCt, candidate, previewData);
                }
            }
        );
    },

    onDismissCandidateClick: function() {
        this.promptDecision('dismissed', 'Dismiss candidate pair', 'Why aren’t these the same person?');
    },

    onDeferCandidateClick: function() {
        this.promptDecision('deferred', 'Defer candidate pair', 'What are we waiting on?');
    },


    // controller methods

    /**
     * Fetch GET /people/merge/preview for the compare view's currently
     * selected candidate + direction, or clear the preview when nothing
     * is selected
     * @param {SlateAdmin.view.mergequeue.Compare} compareCt
     * @param {SlateAdmin.model.mergequeue.Candidate} candidate
     * @return {void}
     */
    loadPreview: function(compareCt, candidate) {
        var reversed, sourceID, targetID;

        if (!candidate) {
            compareCt.setPreviewData(null);
            return;
        }

        reversed = compareCt.getReversed();
        sourceID = reversed ? candidate.get('Person2ID') : candidate.get('Person1ID');
        targetID = reversed ? candidate.get('Person1ID') : candidate.get('Person2ID');

        compareCt.setLoading(true);

        Slate.API.request({
            url: '/people/merge/preview',
            method: 'GET',
            headers: {
                Accept: 'application/json'
            },
            params: {
                source: sourceID,
                target: targetID
            },
            success: function(response) {
                compareCt.setLoading(false);

                if (compareCt.getCandidate() === candidate) {
                    compareCt.setPreviewData(response.data.data);
                }
            },
            failure: function(response) {
                compareCt.setLoading(false);
                Ext.Msg.alert(
                    'Could not load preview',
                    Ext.util.Format.htmlEncode(this.responseMessage(response))
                );
            },
            scope: this
        });
    },

    // @private
    executeMerge: function(compareCt, candidate, previewData) {
        var me = this;

        compareCt.setLoading('Merging&hellip;');

        Slate.API.request({
            url: '/people/merge',
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            jsonData: {
                sourceID: previewData.source.ID,
                targetID: previewData.target.ID,
                resolutions: compareCt.getResolutions() || {},
                candidateID: candidate.getId()
            },
            success: function(response) {
                compareCt.setLoading(false);

                Ext.toast('Merged ' + me.personLabel(previewData.source) + ' into ' + me.personLabel(previewData.target));

                me.onDecisionComplete(candidate, {
                    Status: 'merged',
                    MergeAuditID: response.data.data && response.data.data.ID
                });
            },
            failure: function(response) {
                compareCt.setLoading(false);
                Ext.Msg.alert('Merge failed', Ext.util.Format.htmlEncode(me.responseMessage(response)));

                // the server-reported conflicts may have moved on since our
                // preview was fetched (e.g. a concurrent edit) -- refresh it
                me.loadPreview(compareCt, candidate);
            }
        });
    },

    // @private
    promptDecision: function(status, title, promptLabel) {
        var me = this,
            compareCt = me.getCompareCt(),
            candidate = compareCt.getCandidate();

        if (!candidate) {
            return;
        }

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
                    Ext.Msg.alert('Notes required', 'Please enter a note to record this decision.');
                    return;
                }

                me.recordDecision(compareCt, candidate, status, notes.trim());
            }
        });
    },

    // @private
    recordDecision: function(compareCt, candidate, status, notes) {
        var me = this;

        compareCt.setLoading(true);

        Slate.API.request({
            url: '/people/merge/candidates/' + candidate.getId(),
            method: 'PATCH',
            headers: {
                Accept: 'application/json'
            },
            jsonData: {
                status: status,
                notes: notes
            },
            success: function(response) {
                compareCt.setLoading(false);
                Ext.toast('Candidate pair ' + status);
                me.onDecisionComplete(candidate, response.data.data);
            },
            failure: function(response) {
                compareCt.setLoading(false);
                Ext.Msg.alert('Could not record decision', Ext.util.Format.htmlEncode(me.responseMessage(response)));
            }
        });
    },

    /**
     * A decision (merge/dismiss/defer) landed successfully -- update the
     * candidate row in place (never a full reload), drop it from the
     * queue if it no longer matches the active status filter, and advance
     * the selection to the next open pair
     * @param {SlateAdmin.model.mergequeue.Candidate} candidate
     * @param {Object} updatedFields
     * @return {void}
     */
    onDecisionComplete: function(candidate, updatedFields) {
        var queueController = this.application.getController('MergeQueue'),
            store = queueController.getMergequeueCandidatesStore(),
            filterStatus = store.getProxy().extraParams.status,
            index = store.indexOf(candidate);

        candidate.set(updatedFields || {}, { dirty: false });

        if (filterStatus !== 'all' && candidate.get('Status') !== filterStatus) {
            store.remove(candidate);
        }

        queueController.advanceSelection(index);
    },

    // @private
    buildImpactSummary: function(impact) {
        var totalMoved = 0,
            totalDeduped = 0;

        Ext.each(impact || [], function(row) {
            totalMoved += row.moved;
            totalDeduped += row.deduped;
        });

        return totalMoved + ' row(s) will move to the target; ' + totalDeduped + ' duplicate row(s) will be dropped.';
    },

    // @private
    personLabel: function(person) {
        return person ? (person.FirstName + ' ' + person.LastName) : 'this record';
    },

    // @private
    responseMessage: function(response) {
        return (response && response.data && response.data.message) ||
            'Please try again. If this problem persists, contact support.';
    }
});
