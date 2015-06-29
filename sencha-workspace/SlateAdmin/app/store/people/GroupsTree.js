/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.people.GroupsTree', {
    extend: 'Ext.data.TreeStore',

    model: 'SlateAdmin.model.person.Group',
    root: {
        text: 'All People',
        Handle: 'slate-internal-people-root-node',
        ID: null
    },
    nodeParam: 'parentGroup',

    onBeforeNodeExpand: function(node, callback, scope, args) {
        var me = this,
            groupsStore, callbackArgs,
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
            groupsStore = Ext.getStore('people.Groups');

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
                record.set('namesPath', parent.get('namesPath') + '/' + record.get('Name'));
                parent.appendChild(record, true, true);
            } else {
                Ext.Logger.warn('Could not find parent for group in GroupsTree.loadFromArray');
            }
        }
    }
});
