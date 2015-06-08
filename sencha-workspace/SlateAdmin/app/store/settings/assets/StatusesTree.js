/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.settings.assets.StatusesTree', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'SlateAdmin.model.asset.Status'
    ],
    
    model: 'SlateAdmin.model.asset.Status',
    autoSync: true,
    root: {
        text: 'All Statuses',
        ID: null
    },    
    nodeParam: 'parentStatus',
    
    proxy: {
        type: 'slaterecords',
        url: '/assets/statuses',
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json',
            root: 'data',
            writeAllFields: false,
            allowSingle: false
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
                record.set('namesPath', parent.get('namesPath') + '/' + record.get('Title'));
                parent.appendChild(record, true, true);
            } else {
                Ext.Logger.warn('Could not find parent for group in TermsTree.loadFromArray');
            }
        }
    }
});
