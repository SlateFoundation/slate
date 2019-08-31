/**
 * Provides a tree-structured mirror of a flat dataset with nesting properties.
 *
 * Because tree views decorate models with view state, we create cloned records
 * and bi-directionally sync only the underlying model's fields
 */
Ext.define('Emergence.store.ChainedTree', {
    extend: 'Ext.data.TreeStore',
    alias: 'store.emergence-chainedtree',
    requires: [
        'Ext.data.NodeInterface'
    ],


    config: {
        source: null,
        idProperty: 'ID',
        parentIdProperty: 'ParentID',

        nodeParam: 'parent',
        defaultRootId: 0,
        root: {
            expanded: true,
            leaf: false,
            loaded: true
        }
    },

    listeners: {
        add: function(store, treeRecords) {
            var me = this,
                sourceStore = me.getSource(),
                Model = sourceStore.getModel(),
                fieldsMap = Model.getFieldsMap(),
                recordsLength = treeRecords.length, recordIndex = 0, treeRecord,
                toAdd = [], treeNodeData, data, fieldName, record;

            for (; recordIndex < recordsLength; recordIndex++) {
                treeRecord = treeRecords[recordIndex];

                if (treeRecord.isRoot()) {
                    continue;
                }

                if (!sourceStore.getById(treeRecord.getId())) {
                    treeNodeData = treeRecord.getData();
                    data = {};

                    for (fieldName in treeNodeData) {
                        if (fieldsMap[fieldName]) {
                            data[fieldName] = treeNodeData[fieldName];
                        }
                    }

                    record = new Model(data);

                    if (treeRecord.modified) {
                        record.modified = Ext.apply({}, treeRecord.modified);
                    }

                    record.dirty = treeRecord.dirty;
                    record.dropped = treeRecord.dropped;
                    record.phantom = treeRecord.phantom;

                    toAdd.push(record);
                }
            }

            if (toAdd.length) {
                sourceStore.add(toAdd);
            }
        },
        remove: function(store, treeRecords) {
            const sourceStore = this.getSource();
            const toRemove = [];

            for (const treeRecord of treeRecords) {
                const record = sourceStore.getById(treeRecord.getId());

                if (record) {
                    toRemove.push(record);
                }
            }

            sourceStore.remove(toRemove);
        }
    },


    // config handlers
    applySource: function(sourceStore) {
        return Ext.data.StoreManager.lookup(sourceStore);
    },

    updateSource: function(sourceStore) {
        sourceStore.on({
            scope: this,
            beforeload: 'onSourceBeforeLoad',
            load: 'onSourceLoad',
            update: 'onSourceUpdate',
            add: 'onSourceAdd',
            remove: 'onSourceRemove',
            beginupdate: 'onSourceBeginUpdate',
            endupdate: 'onSourceEndUpdate',
            datachanged: 'onSourceDataChanged'
        });

        var Model = sourceStore.getModel(),
            TreeModel = Model.prototype.isNode ? Model : null;

        if (!TreeModel) {
            TreeModel = Ext.define(null, {
                extend: Model
            });
        }

        this.setModel(TreeModel);

        if (sourceStore.isLoaded()) {
            this.loadTreeRecords(sourceStore.getRange());
        }
    },


    // event handlers
    onSourceBeforeLoad: function(sourceStore, operation) {
        this.fireEvent('beforeload', this, operation);
    },

    onSourceLoad: function(sourceStore, records, successful, operation) {
        this.loadTreeRecords(records);
        this.fireEvent('load', this, records, successful, operation);
    },

    onSourceUpdate: function (sourceStore, sourceRecord, operation, modifiedFieldNames) {
        var record = this.getNodeById(sourceRecord.getId()),
            fieldsLength, i = 0, fieldName,
            commit = false,
            dirty = false,
            set = {};

        switch (operation) {
            case Ext.data.Model.COMMIT:
                commit = true;
                // fall through
            case Ext.data.Model.EDIT:
                if (!modifiedFieldNames || !record) {
                    break;
                }

                fieldsLength = modifiedFieldNames.length;

                for (; i < fieldsLength; i++) {
                    fieldName = modifiedFieldNames[i];
                    set[fieldName] = sourceRecord.get(fieldName);
                    dirty = true;
                }

                if (dirty) {
                    record.set(set, { commit: commit });
                } else if (commit) {
                    record.commit();
                }

                break;
            case Ext.data.Model.REJECT:
                if (record) {
                    record.reject();
                }
                break;
        }
    },

    onSourceAdd: function(sourceStore, records) {
        var me = this,
            recordsLength = records.length, recordIndex = 0, record,
            toAdd = [];

        for (; recordIndex < recordsLength; recordIndex++) {
            record = records[recordIndex];

            if (!me.getNodeById(record.getId())) {
                toAdd.push(me.cloneTreeRecord(record));
            }
        }

        if (toAdd.length) {
            me.add(toAdd);
        }
    },

    onSourceRemove: function(sourceStore, records) {
        const toRemove = [];

        for (const record of records) {
            const treeRecord = this.getNodeById(record.getId());

            if (treeRecord) {
                toRemove.push(treeRecord);
            }
        }

        this.remove(toRemove);
    },

    onSourceBeginUpdate: function() {
        this.beginUpdate();
    },

    onSourceEndUpdate: function() {
        this.endUpdate();
    },

    onSourceDataChanged: function() {
        this.data.sortItems();
    },

    onUpdate: function(record, operation, modifiedFieldNames) {
        var sourceRecord = this.getSource().getById(record.getId()),
            fieldsLength, i = 0, fieldName,
            fieldsMap,
            commit = false,
            dirty = false,
            set = {};

        switch (operation) {
            case Ext.data.Model.COMMIT:
                commit = true;
                // fall through
            case Ext.data.Model.EDIT:
                if (!modifiedFieldNames || !sourceRecord) {
                    break;
                }

                fieldsLength = modifiedFieldNames.length;
                fieldsMap = sourceRecord.getFieldsMap();

                for (; i < fieldsLength; i++) {
                    fieldName = modifiedFieldNames[i];
                    if (fieldsMap[fieldName]) {
                        set[fieldName] = record.get(fieldName);
                        dirty = true;
                    }
                }

                if (dirty) {
                    sourceRecord.set(set, { commit: commit });
                } else if (commit) {
                    sourceRecord.commit();
                }

                break;
            case Ext.data.Model.REJECT:
                if (sourceRecord) {
                    sourceRecord.reject();
                }
                break;
        }

        this.callParent(arguments);
    },


    // member methods
    load: function(options) {
        return this.getSource().load(options);
    },

    hasPendingLoad: function() {
        return this.getSource().hasPendingLoad();
    },

    isLoaded: function() {
        return this.getSource().isLoaded();
    },

    isLoading: function() {
        return this.getSource().isLoading();
    },

    /**
     * Load a flat array of records into the tree
     */
    loadTreeRecords: function(records) {
        var me = this,
            idProperty = me.getIdProperty(),
            parentIdProperty = me.getParentIdProperty(),
            rootNode = me.getRoot(),
            recordsLength = records.length,
            i = 0, record, parentId, parent;

        me.beginUpdate();
        me.ignoreCollectionAdd = true;

        rootNode.removeAll();

        for (; i < recordsLength; i++) {
            record = records[i];
            parentId = record.get(parentIdProperty);
            parent = parentId ? rootNode.findChild(idProperty, parentId, true) : rootNode;

            if (parent) {
                parent.appendChild(me.cloneTreeRecord(record), true, true);
            } else {
                Ext.Logger.warn('could not find parent for chained tree record');
            }
        };

        me.data.sortItems();
        rootNode.expand();

        me.ignoreCollectionAdd = false;
        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);
        me.endUpdate();
    },

    /**
     * Inspired by Model.clone and Model.copy
     * @param {Ext.data.Model} record
     */
    cloneTreeRecord: function(record) {
        if (record.isNode) {
            return record;
        }

        var TreeModel = this.getModel(),
            data = Ext.apply({}, record.data),
            treeRecord = new TreeModel(data),
            modified = record.modified;

        if (modified) {
            treeRecord.modified = Ext.apply({}, modified);
        }

        treeRecord.dirty = record.dirty;
        treeRecord.dropped = record.dropped;
        treeRecord.phantom = record.phantom;

        return treeRecord;
    }
});
