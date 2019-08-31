Ext.define('Jarvus.override.data.RequireLoadedStores', {
    override: 'Ext.data.StoreManager',


    requireLoaded: function(stores, callback, scope) {
        var me = this,
            storesLength = stores.length,
            storeIndex = 0, store,
            queue = [],
            onStoreLoad = function(store) {
                if (store) {
                    Ext.Array.remove(queue, store);
                }

                if (!queue.length) {
                    Ext.callback(callback, scope || me);
                }
            };

        // lookup and add all unloaded stores to queue
        for (; storeIndex < storesLength; storeIndex++) {
            store = me.lookup(stores[storeIndex]);

            if (store.isLoaded()) {
                continue;
            }

            queue.push(store);

            store.on('load', onStoreLoad, me, { single: true });

            if (!store.isLoading()) {
                store.load();
            }
        }

        // call immediately in case queue is already empty
        onStoreLoad();
    }
});