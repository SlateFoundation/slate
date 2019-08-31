/**
 * Fixes issue where all grid cells are right-aligned by default
 * in development.
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?325776
 */
Ext.define('Jarvus.hotfixes.grid.column.RtlAlign', {
    override: 'Ext.grid.column.Column',


    updateAlign: function(align) {
        return (this.isLocalRtl && this.isLocalRtl() ? {
            start: 'right',
            end: 'left'
        } : {
            start: 'left',
            end: 'right'
        })[align];
    }
});
