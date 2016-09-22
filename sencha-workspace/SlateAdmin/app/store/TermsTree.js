/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.TermsTree', {
    extend: 'Ext.data.TreeStore',

    model: 'SlateAdmin.model.Term',
    root: {
        text: 'All Terms',
        ID: null
    },

    onBeforeNodeExpand: function(node, callback, scope, args) {
        var me = this,
            termsStore, callbackArgs,
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
            termsStore = Ext.getStore('Terms');

            if (termsStore.isLoaded()) {
                me.loadFromArray(termsStore.getRange());
                _finishExpand();
            } else {
                node.set('loading', true);
                termsStore.load(function(records) {
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
                record.set('titlesPath', parent.get('titlesPath') + '/' + record.get('Title'));
                parent.appendChild(record, true, true);
            } else {
                Ext.Logger.warn('Could not find parent for term in TermsTree.loadFromArray');
            }
        }
    }
});
