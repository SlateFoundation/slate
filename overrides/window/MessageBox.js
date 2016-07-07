Ext.define('SlateTheme.window.MessageBox', {
    override: 'Ext.window.MessageBox',

    beforeRender: function() {
        var me = this;

         me.callParent();
         me.topContainer.padding = 18;
    }
});