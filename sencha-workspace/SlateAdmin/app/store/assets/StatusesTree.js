/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.assets.StatusesTree', {
    extend: 'Ext.data.TreeStore',

    model: 'SlateAdmin.model.asset.Status',
    parentIdProperty: 'ParentID',
    
    root: {
        text: 'All Statuses',
        ID: null,
        ParentID: null
    },
    
    proxy: {
        type: 'slaterecords',
        url: '/asset/statuses',
        include: 'assetsCount',
        startParam: false,
        limitParam: false,
        extraParams: {
            parentStatus: 'any'
        }
    },
    
    onBeforeNodeExpand: function(node, callback, scope, args) {
        var me = this,
            statusesStore = Ext.getStore('assets.Statuses'), rootNode, records = [],
            callbackArgs,
            _finishExpand = function() {
                callbackArgs = [node.childNodes];
                if (args) {
                    callbackArgs.push.apply(callbackArgs, args);
                }
                Ext.callback(callback, scope || node, callbackArgs);
            },
            _onStatusesStoreLoad = function(records) {
                records = me.treeify(node, records, me.parentIdProperty);
                records = me.fillNode(node, records);
                
                node.set('loading', false);
                _finishExpand();
            };

        if (node.isLoaded()) {
            _finishExpand();
        } else if (node == me.getRootNode()){
            node.set('loading', true);
            if (statusesStore.isLoaded()) {
                _onStatusesStoreLoad(statusesStore.getRange());
            } else if (statusesStore.isLoading()) {
                statusesStore.on('load', _onStatusesStoreLoad, undefined, {single: true});
            } else {
                //wait a sec to see if store incase store is about to be loading
                Ext.defer(function() {
                    if (statusesStore.isLoaded()) {                
                        _onStatusesStoreLoad(statusesStore.getRange());
                    } else {
                        statusesStore.load(_onStatusesStoreLoad);
                    }
                }, 500, me);

            }
        }
    }
});