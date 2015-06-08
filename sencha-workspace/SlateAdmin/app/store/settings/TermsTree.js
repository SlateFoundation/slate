/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.store.settings.TermsTree', {
    extend: 'Ext.data.TreeStore',
    
    model: 'SlateAdmin.model.Term',
    
    autoSync: true,
    root: {
        text: 'All Terms',
        ID: null
    },
    
    nodeParam: 'parentTerm',
    proxy: {
        type: 'slaterecords',
        url: '/terms',
        api: {
            read: '/terms/tree'
        },
        reader: {
            type: 'json',
            root: 'data'
        },
        write: {
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
