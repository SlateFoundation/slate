Ext.define('Jarvus.ext.override.data.StoreIsLoaded', {
    override: 'Ext.data.Store',

    constructor: function() {
        var me = this,
            markLoaded = function() {
                me.loaded= true;
            };
        
        me.callParent(arguments);

        me.on({
            load: markLoaded,
            datachanged: markLoaded
        });
    },

    /**
     * Returns true if the Store is currently performing a load operation
     * @return {Boolean} True if the Store is currently loading
     */
    isLoading: function() {
        return Boolean(this.loading);
    },

    /**
     * Returns true if the Store has been loaded.
     * @return {Boolean} True if the Store has been loaded
     */
    isLoaded: function() {
        return Boolean(this.loaded);
    }
});