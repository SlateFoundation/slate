/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.GroupsTree', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.groupstree',

    config: {
        source: 'people.Groups',
        parentIdProperty: 'ParentID'
    },

    nodeParam: 'parentGroup',

    applySource: function(store) {
        return Ext.data.StoreManager.lookup(store);
    },

    updateSource: function(store) {
        store.on({
            update: 'onSourceUpdate',
            scope: this
        });
    },

    onSourceUpdate: function(sourceStore, sourceRecord, operation) {
        if (operation != 'commit') {
            return;
        }

        var localRecord = this.getNodeById(sourceRecord.getId());
        if (!localRecord) {
            return;
        }

        localRecord.set(sourceRecord.getData({persist: true}), { dirty: false, commit: true});
    },

    onBeforeNodeExpand: function(node, callback, scope, args) {
        var me = this,
            groupsStore = me.getSource(),
            callbackArgs,
            _finishExpand = function() {
                callbackArgs = [node.childNodes];
                if (args) {
                    callbackArgs.push.apply(callbackArgs, args);
                }
                Ext.callback(callback, scope || node, callbackArgs);
            };

        if (node.isLoaded()) {
            _finishExpand();
        } else {
            if (groupsStore.isLoaded()) {
                me.loadFromArray(groupsStore.getRange());
                _finishExpand();
            } else {
                node.set('loading', true);
                groupsStore.load(function(records) {
                    me.loadFromArray(records);
                    node.set('loading', false);
                    _finishExpand();
                });
            }
        }
    },

    loadFromArray: function(records) {
        var rootNode = this.getRootNode(),
            recordsLength = records.length, i = 0, record, parentId, parent;

        rootNode.removeAll();

        for (; i < recordsLength; i++) {
            record = records[i];
            parentId = record.get('ParentID');
            parent = parentId ? rootNode.findChild('ID', parentId, true) : rootNode;

            if (parent) {
                parent.appendChild(Ext.create('SlateAdmin.model.person.Group', Ext.apply({}, record.getData())), true, true);
            } else {
                Ext.Logger.warn('Could not find parent for group in GroupsTree.loadFromArray');
            }
        }
    },

    listeners: {
        update: function(store, record, operation, modifiedFieldNames, details) {
            if (!record.dirty) {
                return;
            }

            var sourceRecord = this.getSource().getById(record.getId());

            sourceRecord.set(record.getChanges());
            sourceRecord.save();
        }
    }
});
