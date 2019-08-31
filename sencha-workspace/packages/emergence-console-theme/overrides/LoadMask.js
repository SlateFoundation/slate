Ext.define('EmergenceConsoleTheme.LoadMask', {
    override: 'Ext.LoadMask',

    initComponent: function() {
        var me = this;
        me.callParent();

        me.msg = 'Loading';
    }
});