/**
 * Works around issue where a grid's scroll will jump back to last focused record when a group is expanded/collapsed
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?336643
 */
Ext.define('Jarvus.hotfixes.view.TableReplaceScroll', {
    override: 'Ext.view.Table',


    onReplace: function() {
        this.saveScrollState();
        this.callParent(arguments);
        this.restoreScrollState();
    }
});
