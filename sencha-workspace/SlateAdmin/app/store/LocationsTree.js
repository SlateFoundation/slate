/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.LocationsTree', {
    extend: 'Ext.data.TreeStore',

    model: 'SlateAdmin.model.Location',
    parentIdProperty: 'ParentID',
    
    root: {
        text: 'All Locations',
        ID: null,
        ParentID: null
    },
    
    proxy: {
        type: 'slaterecords',
        url: '/locations',
        include: 'Population',
        startParam: false,
        limitParam: false,
        extraParams: {
            parentLocation: 'any'
        }
    },
    
    onBeforeNodeExpand: function(node, callback, scope, args) {
        var me = this,
            locationsStore = Ext.getStore('Locations'), rootNode, records = [],
            callbackArgs,
            _finishExpand = function() {
                callbackArgs = [node.childNodes];
                if (args) {
                    callbackArgs.push.apply(callbackArgs, args);
                }
                Ext.callback(callback, scope || node, callbackArgs);
            },
            _onLocationsStoreLoad = function(records) {
                records = me.treeify(node, records, me.parentIdProperty);
                records = me.fillNode(node, records);
                
                node.set('loading', false);
                _finishExpand();
            };

        if (node.isLoaded()) {
            _finishExpand();
        } else if (node == me.getRootNode()){
            node.set('loading', true);
            if (locationsStore.isLoaded()) {
                _onLocationsStoreLoad(locationsStore.getRange());
            } else if (locationsStore.isLoading()) {
                locationsStore.on('load', _onLocationsStoreLoad, undefined, {single: true});
            } else {
                //wait a sec to see if store incase store is about to be loading
                Ext.defer(function() {
                    if (locationsStore.isLoaded()) {                
                        _onLocationsStoreLoad(locationsStore.getRange());
                    } else {
                        locationsStore.load(_onLocationsStoreLoad);
                    }
                }, 500, me);

            }
        }
    }
});