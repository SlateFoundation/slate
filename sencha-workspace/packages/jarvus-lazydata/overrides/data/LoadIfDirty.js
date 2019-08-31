Ext.define('Jarvus.override.data.LoadIfDirty', {
    override: 'Ext.data.ProxyStore',

    loadIfDirty: function(callback, scope) {
        var me = this;

        if (!me.isLoading() && (!me.isLoaded() || me.getProxy().isExtraParamsDirty())) {
            me.load({
                callback: callback,
                scope: scope
            });
        } else {
            Ext.callback(callback, scope);
        }
    }
});