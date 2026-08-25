/**
 * Side-by-side compare view for one duplicate-candidate pair, fed by
 * GET /people/merge/preview (see the mergequeue.Compare controller, which
 * owns the actual API calls -- this view is purely declarative: it renders
 * whatever preview payload it's given and announces user intent through
 * named actions and semantic events).
 */
Ext.define('SlateAdmin.view.mergequeue.Compare', function() {
    var personTpl = new Ext.XTemplate(
        '<tpl if="person">',
        '    <h3 class="mergequeue-person-name">{person.FirstName:htmlEncode} {person.LastName:htmlEncode}</h3>',
        '    <div class="mergequeue-person-meta muted">{person.Username:htmlEncode}</div>',
        '    <div class="mergequeue-person-role">{roleLabel}</div>',
        '<tpl else>',
        '    <div class="muted">&hellip;</div>',
        '</tpl>'
    );

    var impactTpl = new Ext.XTemplate(
        '<tpl if="impact">',
        '    <table class="mergequeue-impact-table">',
        '        <thead><tr><th>Table</th><th>Moved</th><th>Deduped</th></tr></thead>',
        '        <tbody>',
        '        <tpl for="impact">',
        '            <tr class="<tpl if="!moved && !deduped">zero-impact</tpl>">',
        '                <td>{label:htmlEncode}</td><td>{moved}</td><td>{deduped}</td>',
        '            </tr>',
        '        </tpl>',
        '        </tbody>',
        '    </table>',
        '<tpl else>',
        '    <div class="muted">Select a candidate pair to see impact.</div>',
        '</tpl>'
    );

    var conflictsTpl = new Ext.XTemplate(
        '<tpl if="conflicts">',
        '    <tpl if="conflicts.length">',
        '        <ul class="mergequeue-conflicts-list">',
        '        <tpl for="conflicts">',
        '            <li class="mergequeue-conflict-row">',
        '                <div class="conflict-field">{field:htmlEncode}</div>',
        '                <button type="button" data-action="pick-resolution" data-resolution-key="{resolutionKey:htmlEncode}" data-value="{sourceValue:htmlEncode}"',
        '                    class="conflict-option <tpl if="this.isSelected(resolutionKey, sourceValue, parent.resolutions)">selected</tpl>">',
        '                    Keep source: {sourceValue:htmlEncode}',
        '                </button>',
        '                <button type="button" data-action="pick-resolution" data-resolution-key="{resolutionKey:htmlEncode}" data-value="{targetValue:htmlEncode}"',
        '                    class="conflict-option <tpl if="this.isSelected(resolutionKey, targetValue, parent.resolutions)">selected</tpl>">',
        '                    Keep target: {targetValue:htmlEncode}',
        '                </button>',
        '            </li>',
        '        </tpl>',
        '        </ul>',
        '    <tpl else>',
        '        <div class="muted">No identity conflicts.</div>',
        '    </tpl>',
        '<tpl else>',
        '    <div class="muted">Select a candidate pair to see conflicts.</div>',
        '</tpl>',
        {
            isSelected: function(key, value, resolutions) {
                return Boolean(resolutions) && String(resolutions[key]) === String(value);
            }
        }
    );

    var followupsTpl = new Ext.XTemplate(
        '<tpl if="followupActions">',
        '    <tpl if="followupActions.length">',
        '        <ul class="mergequeue-followups-list">',
        '        <tpl for="followupActions">',
        '            <li>',
        '                <strong>{type:htmlEncode}</strong> via {connector:htmlEncode}',
        '                <tpl if="hasExecutor">',
        '                    <span class="badge badge-success">Executor available</span>',
        '                <tpl else>',
        '                    <span class="badge">Manual follow-up</span>',
        '                </tpl>',
        '            </li>',
        '        </tpl>',
        '        </ul>',
        '    <tpl else>',
        '        <div class="muted">No follow-up actions implied.</div>',
        '    </tpl>',
        '<tpl else>',
        '    <div class="muted">Select a candidate pair to see follow-up actions.</div>',
        '</tpl>'
    );

    return {
        extend: 'Ext.panel.Panel',
        xtype: 'mergequeue-compare',


        // mergequeue-compare config
        config: {
            candidate: null,
            reversed: false,
            previewData: null,
            resolutions: null,
            loading: false
        },

        // panel config
        border: false,
        bodyPadding: 12,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'container',
            itemId: 'personsRow',
            cls: 'mergequeue-persons-row',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'component',
                itemId: 'sourceCmp',
                flex: 1,
                cls: 'mergequeue-person-panel mergequeue-person-source',
                tpl: personTpl
            }, {
                xtype: 'button',
                itemId: 'flipBtn',
                action: 'flip-direction',
                glyph: 0xf0ec, // fa-exchange
                tooltip: 'Flip merge direction',
                margin: '20 10 0 10'
            }, {
                xtype: 'component',
                itemId: 'targetCmp',
                flex: 1,
                cls: 'mergequeue-person-panel mergequeue-person-target',
                tpl: personTpl
            }]
        }, {
            xtype: 'container',
            itemId: 'sectionsCt',
            flex: 1,
            autoScroll: true,
            cls: 'mergequeue-sections',
            items: [{
                xtype: 'component',
                itemId: 'impactCmp',
                cls: 'mergequeue-section mergequeue-impact',
                tpl: impactTpl
            }, {
                xtype: 'component',
                itemId: 'conflictsCmp',
                cls: 'mergequeue-section mergequeue-conflicts',
                tpl: conflictsTpl
            }, {
                xtype: 'component',
                itemId: 'followupsCmp',
                cls: 'mergequeue-section mergequeue-followups',
                tpl: followupsTpl
            }]
        }],

        dockedItems: [{
            dock: 'bottom',
            xtype: 'toolbar',
            itemId: 'actionsBar',
            items: [{
                xtype: 'button',
                itemId: 'dismissBtn',
                action: 'dismiss-candidate',
                text: 'Dismiss',
                glyph: 0xf05e, // fa-ban
                disabled: true
            }, {
                xtype: 'button',
                itemId: 'deferBtn',
                action: 'defer-candidate',
                text: 'Defer',
                glyph: 0xf017, // fa-clock-o
                disabled: true
            }, {
                xtype: 'tbfill'
            }, {
                xtype: 'button',
                itemId: 'mergeBtn',
                action: 'merge-candidate',
                text: 'Merge',
                glyph: 0xf0ec, // fa-exchange
                cls: 'glyph-success',
                disabled: true
            }]
        }],


        // mergequeue-compare methods
        // @private
        updateCandidate: function(candidate, oldCandidate) {
            var me = this;

            Ext.suspendLayouts();
            me.setReversed(false);
            me.setPreviewData(null);
            me.setResolutions({});
            me.syncActionButtons();
            Ext.resumeLayouts(true);

            me.fireEvent('candidatechange', me, candidate, oldCandidate);
        },

        // @private
        updateReversed: function(reversed) {
            this.fireEvent('reversedchange', this, reversed);
        },

        // @private
        updatePreviewData: function(previewData) {
            var me = this;

            // config updaters can fire during construction, before
            // initComponent has cached child refs -- a no-op here is fine,
            // initComponent calls this again once refs exist (see below)
            if (!me.sourceCmp) {
                return;
            }

            Ext.suspendLayouts();

            me.sourceCmp.update({
                person: previewData ? previewData.source : null,
                roleLabel: 'Source — retires'
            });
            me.targetCmp.update({
                person: previewData ? previewData.target : null,
                roleLabel: 'Target — survives'
            });
            me.impactCmp.update({
                impact: previewData ? previewData.impact : null
            });
            me.conflictsCmp.update({
                conflicts: previewData ? previewData.conflicts : null,
                resolutions: me.getResolutions()
            });
            me.followupsCmp.update({
                followupActions: previewData ? previewData.followupActions : null
            });

            me.syncActionButtons();

            Ext.resumeLayouts(true);
        },

        // @private
        updateResolutions: function(resolutions) {
            var me = this,
                previewData = me.getPreviewData();

            if (!me.conflictsCmp) {
                return;
            }

            me.conflictsCmp.update({
                conflicts: previewData ? previewData.conflicts : null,
                resolutions: resolutions
            });

            me.syncActionButtons();
        },

        // @private
        updateLoading: function(loading) {
            this.setLoading(loading ? 'Loading preview&hellip;' : false);
        },

        /**
         * True once every conflict reported by the loaded preview has a
         * chosen resolution.
         */
        isFullyResolved: function() {
            var previewData = this.getPreviewData(),
                resolutions = this.getResolutions() || {};

            if (!previewData || !previewData.conflicts) {
                return true;
            }

            return Ext.Array.every(previewData.conflicts, function(conflict) {
                return Object.prototype.hasOwnProperty.call(resolutions, conflict.resolutionKey);
            });
        },

        /**
         * Sync the dismiss/defer/merge buttons' enabled state and the merge
         * button's label from current candidate/preview/resolutions state
         */
        syncActionButtons: function() {
            var me = this,
                candidate = me.getCandidate(),
                previewData = me.getPreviewData(),
                targetName;

            if (!me.mergeBtn) {
                return;
            }

            me.dismissBtn.setDisabled(!candidate);
            me.deferBtn.setDisabled(!candidate);

            me.mergeBtn.setDisabled(!candidate || !previewData || !me.isFullyResolved());

            targetName = previewData && previewData.target
                ? Ext.util.Format.htmlEncode(previewData.target.FirstName + ' ' + previewData.target.LastName)
                : null;

            me.mergeBtn.setText(targetName ? 'Merge into ' + targetName : 'Merge');
        },

        // component lifecycle
        // @private
        initComponent: function() {
            var me = this;

            me.callParent(arguments);

            me.sourceCmp = me.down('#sourceCmp');
            me.targetCmp = me.down('#targetCmp');
            me.impactCmp = me.down('#impactCmp');
            me.conflictsCmp = me.down('#conflictsCmp');
            me.followupsCmp = me.down('#followupsCmp');
            me.dismissBtn = me.down('#dismissBtn');
            me.deferBtn = me.down('#deferBtn');
            me.mergeBtn = me.down('#mergeBtn');

            // render whatever settled during construction, since config
            // updaters that fired before the refs above existed were no-ops
            me.updatePreviewData(me.getPreviewData());
        },

        // @private
        afterRender: function() {
            var me = this;

            me.callParent(arguments);

            me.mon(me.el, 'click', 'onConflictOptionClick', me, {
                delegate: '[data-action="pick-resolution"]'
            });
        },


        // event handlers
        // @private
        onConflictOptionClick: function(e, target) {
            var resolutions = Ext.apply({}, this.getResolutions()),
                key = target.getAttribute('data-resolution-key'),
                value = target.getAttribute('data-value');

            resolutions[key] = value;

            this.setResolutions(resolutions);
        }
    };
});
