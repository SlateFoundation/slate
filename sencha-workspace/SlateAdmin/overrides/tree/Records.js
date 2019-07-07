Ext.define('Jarvus.ext.override.tree.Records', {
    override: 'Ext.tree.Panel',

    /**
     * Expand tree to a given record
     * @param {Ext.data.Model} record The record to select
     * @param {Function} [callback] A function to execute when the expand finishes.
     * @param {Object} [scope] The scope of the callback function
     */
    expandRecord: function(record, callback, scope) {
        var expandStack = [record],
            parent = record.parentNode,
            expander, current;

        while (parent) {
            expandStack.unshift(parent);
            parent = parent.parentNode;
        }

        expander = function() {
            if (expandStack.length) {
                current = expandStack.shift();
                current.expand(false, expander);
            } else {
                Ext.callback(callback, scope);
            }
        };

        expander();
    },

    /**
     * Expand tree to a given record and select it. Useful when node ID's can contain arbitrary characters
     * and no suitable seperator can be used for getPath/selectPath
     * @param {Ext.data.Model} record The record to select
     */
    selectRecord: function(record, keepExisting, suppressEvent) {
        var me = this;

        me.expandRecord(record, function() {
            me.getSelectionModel().select(record, keepExisting, suppressEvent);
        });
    }
});