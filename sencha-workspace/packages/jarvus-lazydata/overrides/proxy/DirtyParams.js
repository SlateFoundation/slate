Ext.define('Jarvus.override.proxy.DirtyParams', {
    override: 'Ext.data.proxy.Server',

    extraParamsDirty: false,

    setExtraParam: function(name, value) {
        var me = this,
            extraParams = me.extraParams;

        if (extraParams[name] !== value) {
            me.markParamsDirty();
            extraParams[name] = value;
        }
    },

    patchExtraParams: function(newParams) {
        var extraParams = this.extraParams,
            dirty = false;

        Ext.Object.each(newParams, function(name, value) {
            if (extraParams[name] !== value) {
                dirty = true;
                extraParams[name] = value;
            }
        });

        Ext.Array.each(Ext.Array.difference(Ext.Object.getKeys(extraParams), Ext.Object.getKeys(newParams)), function(name) {
            dirty = true;
            delete extraParams[name];
        });

        if (dirty) {
            this.markParamsDirty();
        }
    },

    resetExtraParams: function() {
        var me = this,
            extraParams = me.extraParams,
            dirty = false,
            name;

        for (name in extraParams) {
            if (extraParams.hasOwnProperty(name)) {
                delete extraParams[name];
                dirty = true;
            }
        }

        if (dirty) {
            me.markParamsDirty();
        }
    },

    markParamsDirty: function() {
        this.extraParamsDirty = true;
    },

    clearParamsDirty: function() {
        this.extraParamsDirty = false;
    },

    isExtraParamsDirty: function() {
        return this.extraParamsDirty;
    },

    buildRequest: function() {
        this.clearParamsDirty();
        return this.callParent(arguments);
    }
});