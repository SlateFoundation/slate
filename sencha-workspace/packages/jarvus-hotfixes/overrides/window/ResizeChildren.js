/**
 * Works around issue where a panel inside a window doesn't get resized correctly after the window is resized
 *
 * Discussion: https://fiddle.sencha.com/#view/editor&fiddle/2bcd
 */
Ext.define('Jarvus.hotfixes.window.ResizeChildren', {
    override: 'Ext.window.Window',


    onShowComplete: function() {
        var me = this;

        me.callParent(arguments);

        if (me.child('container:not(header)')) {
            me.on('resize', 'doResizeChildrenHotfix', me);
        }
    },

    doClose: function() {
        this.un('resize', 'doResizeChildrenHotfix', this);
        this.callParent(arguments);
    },

    doResizeChildrenHotfix: function() {
        this.updateLayout();
    }
});