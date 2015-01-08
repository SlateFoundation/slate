/**
 * Grouping feature will through an error if you try to reconfigure a grid between a buffered and nonbuffered store, even if the feature is disabled.
 * 
 * This patch will make the feature ignore the reconfigure event if the feature is disabled.
 */
Ext.define('Jarvus.ext.patch.grid.DisableGroupingFeature', {
    override: 'Ext.grid.feature.Grouping',
    
    onReconfigure: function() {
        var me = this,
            groupingFeature = this.view.featuresMC.findBy(function(feature) {
                return feature instanceof Ext.grid.feature.Grouping;
            });

        // suppress if disabled
        if (!groupingFeature.disabled) {
            me.callParent(arguments);
        }
    }
});