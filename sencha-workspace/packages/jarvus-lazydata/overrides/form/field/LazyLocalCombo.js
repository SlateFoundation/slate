Ext.define('Jarvus.override.form.field.LazyLocalCombo', {
    override: 'Ext.form.field.ComboBox',

    lazyAutoLoad: true,

    doQuery: function doQuery(rawQuery) {
        var me = this,
            args = arguments,
            previous = args.callee.$previous;

        me.lastRawQuery = rawQuery;

        me.doLazyLoad(true, function() {
            previous.apply(me, args);
        });
    },

    setValue: function(value) {
        var me = this,
            args = arguments,
            previous = args.callee.$previous;

        if (Ext.isEmpty(value)) {
            previous.apply(me, args);
        } else {
            me.pendingValue = value;
            me.doLazyLoad(false, function() {
                previous.apply(me, args);
                delete me.pendingValue;
            });
        }
    },

    doLazyLoad: function(expandBeforeLoad, callback) {
        var me = this,
            store = me.getStore(),
            onLoad;

        // target source store if there is one
        if (typeof store.getSource == 'function') {
            store = store.getSource() || store;
        }

        // do nothing if there's nothing to do
        if (me.queryMode != 'local' || !me.lazyAutoLoad || store.isLoaded()) {
            Ext.callback(callback);
            return;
        }

        onLoad = function() {
            var lastRawQuery = me.lastRawQuery;

            if (lastRawQuery) {
                me.lastRawQuery = null;
                me.setRawValue(lastRawQuery);
            }

            Ext.callback(callback);
        };

        if (store.isLoading()) {
            store.on('load', onLoad, me, { single: true });
        } else {
            if (expandBeforeLoad) {
                me.expand();
            }

            store.load({ callback: onLoad });
        }
    },

    resetOriginalValue: function() {
        var me = this,
            pendingValue = me.pendingValue;

        if (pendingValue) {
            me.originalValue = pendingValue;
            me.checkDirty();
        } else {
            me.callParent(arguments);
        }
    },

    isDirty: function() {
        var me = this,
            pendingValue = me.pendingValue;

        return !me.disabled && !me.isEqual(pendingValue || me.getValue(), me.originalValue);
    },
});