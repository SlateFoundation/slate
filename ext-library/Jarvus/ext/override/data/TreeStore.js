/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Jarvus.ext.override.data.TreeStore', {
    override: 'Ext.data.TreeStore',
    
    /**
     * http://docs-origin.sencha.com/extjs/5.0.1/source/TreeStore.html#Ext-data-TreeStore-cfg-parentIdProperty
     *
     * @cfg {String} [parentIdProperty]
     * This config allows node data to be returned from the server in linear format without having to structure it into `children`
     * arrays.
     *
     * This property specifies which property name in the raw node data yields the id of the parent node.
     *
     */
     
    parentIdProperty: null,
    
    onProxyLoad: function(operation) {
        var me = this,
            options = operation.initConfig(),
            successful = operation.wasSuccessful(),
            records = operation.getRecords(),
            node = options.node,
            scope = operation.scope || me,
            args = [records, operation, successful],
            parentIdProperty = me.parentIdProperty;

        if (me.isDestroyed) {
            return;
        }

        me.loading = false;
        node.set('loading', false);
        if (successful) {
            if (!me.clearOnLoad) {
                records = me.cleanRecords(node, records);
            }

            // Nodes are in linear form, linked to the parent using a parentId property
            if (parentIdProperty) {
                records = me.treeify(node, records, parentIdProperty);
            }
            
            records = me.fillNode(node, records);
        }
        // The load event has an extra node parameter
        // (differing from the load event described in AbstractStore)
        /**
         * @event load
         * Fires whenever the store reads data from a remote data source.
         * @param {Ext.data.TreeStore} this
         * @param {Ext.data.TreeModel[]} records An array of records.
         * @param {Boolean} successful True if the operation was successful.
         * @param {Ext.data.Operation} operation The operation that triggered this load.
         * @param {Ext.data.NodeInterface} node The node that was loaded.
         */
         
        Ext.callback(options.internalCallback, scope, args);
        me.fireEvent('load', me, records, successful, operation, node);
    },
    
    // @private
    // Converts a flat array of nodes into a tree structure.
    // Returns an array which is the childNodes array of the rootNode.
    treeify: function(parentNode, records, parentIdProperty) {
        var me = this,
            parentNodeId = parentNode.getId(),
            len = records.length,
            i,
            node,
            parentId,
            result = [],
            nodeMap = {};

        // Collect all nodes keyed by ID, so that regardless of order, they can all be linked to a parent.
        for (i = 0; i < len; i++) {
            node = records[i];
            nodeMap[node.getId()] = node;
        }

        // Link child nodes up to their parents
        for (i = 0; i < len; i++) {
            node = records[i];
            parentId = node.data[parentIdProperty];

            // If there is no parentId, or the parentId points to the node being loaded, append to the results
            if (!parentId || parentId === parentNodeId) {
                result.push(node);
            }

            // Append to the configured parentNode
            else {
                nodeMap[parentId].appendChild(node);
            }
        }
        
        return result;
    }
    
}, function() {
    // add alias to controller
});
