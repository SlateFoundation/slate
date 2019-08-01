Ext.define('SlateTheme.window.MessageBox', {
    override: 'Ext.window.MessageBox',

    beforeRender: function() {
        var me = this;
         me.callParent();

         // increase message padding
         me.topContainer.padding = 18;

         // right-align buttons
         me.bottomTb.layout.pack = "end";
    }
});