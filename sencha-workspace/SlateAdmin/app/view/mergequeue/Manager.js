/**
 * Container for the duplicate-candidates section's queue grid and compare
 * view. Propagates {@link #cfg-selectedCandidate} into the compare view,
 * following the same "top-level view owns state" contract as
 * {@link SlateAdmin.view.AbstractRecordManager} -- but the detail side here
 * is a single compare component, not a tab panel, so this manager is its
 * own (smaller) contract rather than a subclass of that base.
 */
Ext.define('SlateAdmin.view.mergequeue.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'mergequeue-manager',
    requires: [
        'SlateAdmin.view.mergequeue.CandidatesGrid',
        'SlateAdmin.view.mergequeue.Compare'
    ],


    // mergequeue-manager config
    config: {
        selectedCandidate: null
    },

    // container config
    layout: 'border',
    items: [{
        region: 'west',
        width: 420,
        minWidth: 320,
        maxWidth: 640,
        split: true,

        xtype: 'mergequeue-candidates-grid'
    }, {
        region: 'center',

        xtype: 'mergequeue-compare',
        itemId: 'compareCt'
    }],


    // mergequeue-manager methods
    // @private
    updateSelectedCandidate: function(candidate, oldCandidate) {
        var me = this;

        me.down('#compareCt').setCandidate(candidate);

        me.fireEvent('selectedcandidatechange', me, candidate, oldCandidate);
    }
});
