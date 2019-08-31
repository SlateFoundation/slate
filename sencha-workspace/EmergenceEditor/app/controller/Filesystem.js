/**
 * Controls filesystem sidebar
 *
 * Responsibilities:
 * - Open file on double-click
 * - Show collection/file/multiple context menus
 * - Coordinate renaming tree nodes
 * - Handle context menu items
 * - [ ] Handle multi-node operations
 * - [ ] Handle drag+drop of nodes to move
 * - [ ] Handle drag+drop of external files to upload
 */
Ext.define('EmergenceEditor.controller.Filesystem', {
    extend: 'Ext.app.Controller',
    requires: [
        'Ext.window.MessageBox',

        /* global EmergenceEditor */
        'EmergenceEditor.DAV'
    ],


    // controller config
    stores: [
        'FilesystemTree'
    ],

    views: [
        'menu.Collection',
        'menu.File',
        'menu.Multiple'
    ],

    refs: {
        filesystemTree: 'emergence-filesystemtree',

        collectionMenu: {
            autoCreate: true,

            xtype: 'emergence-menu-collection'
        },

        fileMenu: {
            autoCreate: true,

            xtype: 'emergence-menu-file'
        },

        multipleMenu: {
            autoCreate: true,

            xtype: 'emergence-menu-multiple'
        }
    },

    listen: {
        store: {
            '#FilesystemTree': {
                update: 'onStoreNodeUpdate'
            }
        }
    },

    control: {
        filesystemTree: {
            beforeedit: 'onItemBeforeEdit',
            canceledit: 'onItemCancelEdit',
            edit: 'onItemEdit',
            itemdblclick: 'onItemDblClick',
            itemcontextmenu: 'onItemContextMenu'
        },
        'emergence-menu-file menuitem[action=rename], emergence-menu-collection menuitem[action=rename]': {
            click: 'onNodeRenameClick'
        },
        'emergence-menu-file menuitem[action=delete], emergence-menu-collection menuitem[action=delete]': {
            click: 'onNodeDeleteClick'
        },
        'emergence-menu-collection menuitem[action=refresh]': {
            click: 'onCollectionRefreshClick'
        },
        'emergence-menu-collection menuitem[action=new-file]': {
            click: 'onCollectionNewFileClick'
        },
        'emergence-menu-collection menuitem[action=new-collection]': {
            click: 'onCollectionNewCollectionClick'
        }
    },


    // event handlers
    onStoreNodeUpdate: function(store, node, operation, modifiedFieldNames) {
        var filesystemTree, path, newHandle, newPath, existingNode;

        if (!modifiedFieldNames || !Ext.Array.contains(modifiedFieldNames, 'Handle')) {
            return;
        }

        filesystemTree = this.getFilesystemTree();

        path = node.phantom ? null : node.get('FullPath');
        newHandle = node.get('Handle');
        newPath = node.parentNode.get('FullPath') + '/' + newHandle;

        node.set('loading', true);

        if (path && newPath) {
            // move/rename
            EmergenceEditor.DAV.move(path, newPath).then(function() {
                node.set({
                    loading: false,
                    Handle: newHandle,
                    FullPath: newPath
                }, {
                    dirty: false,
                    commit: true
                });

                node.parentNode.sort();
                filesystemTree.ensureVisible(node, {
                    select: true,
                    focus: true
                });
            }).catch(function(response) {
                var message = response.responseXML && response.responseXML.querySelector('message');

                node.set('loading', false);
                node.reject();

                Ext.Msg.alert('Failed to rename', message ? message.textContent : 'Failed to rename file or collection');
            });
        } else if (node.isLeaf()) {
            existingNode = node.parentNode.findChildBy(function(childNode) {
                return childNode !== node && childNode.get('Handle') == newHandle;
            });

            if (existingNode) {
                Ext.Msg.alert('Cannot rename', 'A file with the same name already exists in the same collection', function() {
                    node.set('renaming', true);
                    filesystemTree.getPlugin('cellediting').startEdit(node, 0);
                });
                return;
            }

            // create new file
            EmergenceEditor.DAV.uploadFile(newPath, '').then(function() {
                node.set({
                    loading: false,
                    Handle: newHandle,
                    FullPath: newPath,
                    Timestamp: new Date()
                }, {
                    dirty: false,
                    commit: true
                });

                node.parentNode.sort();
                filesystemTree.ensureVisible(node, {
                    select: true,
                    focus: true
                });
            }).catch(function(response) {
                var message = response.responseXML && response.responseXML.querySelector('message');

                node.remove();

                Ext.Msg.alert('Failed to create', message ? message.textContent : 'Failed to create file');
            });
        } else {
            // create new collection
            EmergenceEditor.DAV.createCollection(newPath).then(function() {
                node.set({
                    loading: false,
                    Handle: newHandle,
                    FullPath: newPath,
                    Created: new Date()
                }, {
                    dirty: false,
                    commit: true
                });

                node.parentNode.sort();
                filesystemTree.ensureVisible(node, {
                    select: true,
                    focus: true
                });
            }).catch(function(response) {
                var message = response.responseXML && response.responseXML.querySelector('message');

                node.remove();

                Ext.Msg.alert('Failed to create', message ? message.textContent : 'Failed to create collection');
            });
        }
    },

    onItemBeforeEdit: function(editor, context) {
        return context.record.get('renaming');
    },

    onItemCancelEdit: function(editor, context) {
        var node = context.record;

        if (node.phantom) {
            node.remove();
        } else {
            node.set('renaming', false);
        }
    },

    onItemEdit: function(editor, context) {
        context.record.set('renaming', false);
    },

    onItemDblClick: function(filesystemTree, file) {
        if (file.isLeaf()) {
            this.redirectTo(file);
        }
    },

    onItemContextMenu: function(filesystemTree, node, itemDom, index, event) {
        var me = this,
            selectedNodes = filesystemTree.getSelection(),
            menu;

        event.stopEvent();

        if (selectedNodes.length > 1) {
            menu = me.getMultipleMenu();
            menu.setSelectedNodes(selectedNodes);
        } else if (node.isLeaf()) {
            menu = me.getFileMenu();
            menu.setNode(node);
        } else {
            menu = me.getCollectionMenu();
            menu.setNode(node);
        }

        menu.showAt(event.getXY());
    },

    onNodeRenameClick: function(menuItem) {
        var node = menuItem.up('menu').getNode();

        node.set('renaming', true);
        this.getFilesystemTree().getPlugin('cellediting').startEdit(node, 0);
    },

    onNodeDeleteClick: function(menuItem) {
        var node = menuItem.up('menu').getNode(),
            noun = node.isLeaf() ? 'file' : 'collection';

        Ext.Msg.confirm('Delete '+noun, 'Are you sure you want to delete the '+noun+' <strong><code>' + node.get('Handle') + '</code></strong>?', function(btnId) {
            if (btnId != 'yes') {
                return;
            }

            node.set('loading', true);

            EmergenceEditor.DAV.delete(node.get('FullPath')).then(function() {
                node.remove();
            }).catch(function(response) {
                var message = response.responseXML.querySelector('message');

                node.set('loading', false);

                Ext.Msg.alert('Failed to delete', message ? message.textContent : 'Failed to delete file or collection');
            });
        });
    },

    onCollectionRefreshClick: function() {
        this.getFilesystemTreeStore().load({
            node: this.getCollectionMenu().getNode()
        });
    },

    onCollectionNewFileClick: function() {
        var me = this,
            collection = me.getCollectionMenu().getNode();

        collection.expand(false, function() {
            var newFile = collection.insertChild(0, {
                Class: 'SiteFile',
                CollectionID: collection.get('ID'),
                renaming: true
            });

            me.getFilesystemTree().getPlugin('cellediting').startEdit(newFile, 0);
        });
    },

    onCollectionNewCollectionClick: function() {
        var me = this,
            collection = me.getCollectionMenu().getNode();

        collection.expand(false, function() {
            var newCollection = collection.insertChild(0, {
                Class: 'SiteCollection',
                ParentID: collection.get('ID'),
                renaming: true
            });

            me.getFilesystemTree().getPlugin('cellediting').startEdit(newCollection, 0);
        });
    }


    // onTreeRendered: function() {
    //     this.getFilesTree().el.on('dragover', this.onTreeDragover, this);
    //     this.getFilesTree().el.on('dragleave', this.onTreeDragleave, this);
    //     this.getFilesTree().el.on('drop', this.onFilesTreeDrop, this);
    // },
    // onFilesTreeDrop: function(event) {
    //     event.preventDefault();

    //     var e = event.browserEvent;
    //     var treePanel = this.getFilesTree();
    //     var treeView = treePanel.view;
    //     var node = treeView.findTargetByEvent(event);
    //     var record = treeView.getRecord(node);

    //     // if the drop occured on a file assume the file upload is simply being placed into the parent collection
    //     if (record.raw.Class == 'SiteFile') {
    //         record = record.parentNode;
    //     }

    //     if (record.raw.Class == 'SiteCollection') {
    //         // console.log(e.dataTransfer);

    //         var uploadStatus = new Array(e.dataTransfer.files.length);

    //         Ext.each(e.dataTransfer.files, function(file, index, files) {

    //             var path = record.raw.FullPath + '/' + file.name;

    //             // EmergenceEditor.store.DavClient.putDOMFile(path
    //             //     , file
    //             //     , function() {
    //             //         uploadStatus[index] = true;

    //             //         var done = true;

    //             //         Ext.each(uploadStatus, function(status, index, uploadStatus) {
    //             //             if (!status) {
    //             //                 done = false;
    //             //             }
    //             //         }, this);

    //             //         if (done) {
    //             //             this.afterDropUpload.call(this, record, e.dataTransfer.files);
    //             //         }
    //             //     }
    //             //     , function(percentage, event) {
    //             //         // console.log(percentage);
    //             //     }
    //             //     , this);
    //         }, this);
    //     }
    // },
    // afterDropUpload: function(collectionRecord, files) {
    //     // console.log('file upload sequence completed');
    //     this.getFilesTreeStore().refreshNodeByRecord(collectionRecord);
    // },
    // onTreeDragleave: function(event) {
    //     event.preventDefault();

    //     var e = event.browserEvent;
    //     var treePanel = this.getFilesTree();
    //     var treeView = treePanel.view;
    //     var node = treeView.findTargetByEvent(event);

    //     if (node) {
    //         Ext.get(node).removeCls('x-grid-row-focused')
    //     }
    // },
    // onTreeDragover: function(event) {
    //     event.preventDefault();

    //     var e = event.browserEvent;
    //     var treePanel = this.getFilesTree();
    //     var treeView = treePanel.view;
    //     var node = treeView.findTargetByEvent(event);

    //     if (node) {
    //         Ext.get(node).addCls('x-grid-row-focused');

    //         var record = treeView.getRecord(node);

    //         if (record.raw.Class == 'SiteCollection') {
    //             record.expand();
    //         }
    //     }
    // },

    // /*
    //  *           FILE TREE NODE MOVEMENT HANDLERS
    //  */
    // onTreeNodeBeforeDrop: function(node, oldNodeData, overModel, dropPosition, dropHandler) {
    //     var title = oldNodeData.records.length == 1?'Move Item':'Move Multiple Items';
    //     var prompt = oldNodeData.records.length == 1?'Are you sure you want to move this item to ' + overModel.data.FullPath + '?':'Are you sure you want to move these ' + oldNodeData.records.length + ' items to ' + overModel.data.FullPath + '?';

    //     dropHandler.wait = true;

    //     Ext.Msg.confirm(title, prompt, function(button, value, opts) {
    //         if (button == 'yes') {
    //             //                /* Bug Fix Start
    //             //                 * see: http://www.sencha.com/forum/showthread.php?135377-beforedrop-not-working-as-expected&p=623011&viewfull=1#post623011
    //             //                 */
    //             //                var plugin = this.getFilesTree().down('treeview').getPlugin('ddplugin');
    //             //                var dropZone = plugin.dropZone;
    //             //
    //             //                dropZone.overRecord = overModel;
    //             //                dropZone.currentPosition = dropPosition;
    //             //
    //             //                /* Bug Fix End */

    //             dropHandler.processDrop();
    //         }
    //     }, this);

    //     return false;
    // },
    // onTreeNodeMoveDrop: function(node, oldNodeData, overModel, dropPosition, options) {
    //     var from, to;
    //     var toRefresh = {};

    //     Ext.each(oldNodeData.records, function(record) {
    //         from = record.data.FullPath;
    //         to = overModel.data.FullPath + '/' + record.data.text;

    //         // EmergenceEditor.store.DavClient.renameNode(from, to, function() {
    //         //     if (record.parentNode) {
    //         //         if (!toRefresh[record.parentNode.raw.ID]) {
    //         //             toRefresh[record.parentNode.raw.ID] = true;
    //         //             this.getFilesTreeStore().refreshNodeByRecord(record.parentNode);
    //         //         }
    //         //     }
    //         // }, this);
    //     }, this);
    // },

    // /*
    //  *           MULTI NODE CONTEXT MENU EVENT HANDLERS
    //  */
    // onMultiOpenClick: function(menuItem, event, options) {
    //     var selection = this.getFilesTree().getSelectionModel().getSelection();

    //     Ext.each(selection, function(record) {
    //         if (record.raw.Class == 'SiteFile') {
    //             this.openFileByRecord(record);
    //         } else if (record.raw.Class == 'SiteCollection') {
    //             this.getFilesTree().expandPath(record.getPath());
    //         }
    //     }, this);
    // },
    // onMultiDeleteClick: function(menuItem, event, options) {
    //     var selection = this.getFilesTree().getSelectionModel().getSelection();

    //     var toRefresh = {};

    //     Ext.Msg.confirm('Delete Multiple Items', 'Are you sure you want to delete these ' + selection.length + ' items?', function(button, value, options) {
    //         if (button == 'yes') {
    //             Ext.each(selection, function(record) {
    //                 // EmergenceEditor.store.DavClient.deleteNode(record.raw.FullPath, function() {
    //                 //     if (record.parentNode) {
    //                 //         if (!toRefresh[record.parentNode.raw.ID]) {
    //                 //             toRefresh[record.parentNode.raw.ID] = true;
    //                 //             this.getFilesTreeStore().refreshNodeByRecord(record.parentNode);
    //                 //         }
    //                 //     }
    //                 // }, this);
    //             }, this);
    //         }
    //     }, this);
    // }
});