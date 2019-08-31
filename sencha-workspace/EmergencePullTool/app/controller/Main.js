Ext.define('EmergencePullTool.controller.Main', {
    extend: 'Ext.app.Controller',
    requires: [
        'EmergencePullTool.util.Diff',

        /* global Emergence */
        'Emergence.util.API'
    ],


    views: [
        'Main'
    ],

    stores: [
        'ChangesTree'
    ],

    refs: {
        treePanel: 'app-changesgrid',
        selectionStatusCmp: 'app-changesgrid #selectionStatus',
        pullButton: 'app-changesgrid button[action=pull]',

        diffPanel: 'app-diffpanel'
    },

    control: {
        'app-changesgrid': {
            boxready: 'onTreePanelBoxReady',
            checkchange: 'onTreePanelCheckChange',
            itemclick: 'onTreePanelItemClick',
            itemdblclick: 'onTreePanelItemDblClick'
        },
        'button[action=pull]': {
            click: 'onPullButtonClick'
        },
        'button[action=selectall]': {
            click: 'onSelectAllClick'
        }
    },


    syncCheckedCount: function() {
        var me = this,
            checkedNodesLength = me.getTreePanel().getView().getChecked().length;

        me.getSelectionStatusCmp().update({
            count: checkedNodesLength
        });

        me.getPullButton().setDisabled(checkedNodesLength == 0);
    },

    onTreePanelBoxReady: function(treePanel) {
        var me = this,
            changesTreeStore = me.getChangesTreeStore(),
            changesTreeRoot = changesTreeStore.getRootNode();

        // load local tree
        treePanel.setLoading('Loading local file tree&hellip;');
        Emergence.util.API.request({
            url: '/emergence',
            method: 'GET',
            timeout: 600000,
            params: {
                'exclude[]': ['sencha-workspace/(ext|touch)-.*', 'js-library/ext3']
            },
            callback: function(localOptions, localSuccess, localResponse) {
                if (localResponse.status != 300) {
                    alert('Failed to load local tree');
                    return;
                }

                var localData = Ext.decode(localResponse.responseText),
                    localFiles = localData.files,
                    localPaths = Ext.Object.getKeys(localFiles),
                    localPathsLength = localPaths.length, localPathIndex = 0, localPath,
                    localRemotePaths = [];

                // find all local paths with remote source
                for (; localPathIndex < localPathsLength; localPathIndex++) {
                    localPath = localPaths[localPathIndex];

                    if (localFiles[localPath].Site == 'Remote') {
                        localRemotePaths.push(localPath);
                    }
                }

                // load remote tree
                treePanel.setLoading('Loading remote file tree&hellip;');
                Emergence.util.API.request({
                    url: '/emergence',
                    method: 'GET',
                    timeout: 600000,
                    params: {
                        remote: 'parent',
                        'exclude[]': ['sencha-workspace/(ext|touch)-.*', 'js-library/ext3']
                    },
                    callback: function(remoteOptions, remoteSuccess, remoteResponse) {
                        if (remoteResponse.status != 300) {
                            alert('Failed to load remote tree');
                            return;
                        }

                        var remoteData = Ext.decode(remoteResponse.responseText),
                            remoteFiles = remoteData.files,
                            remotePaths = Ext.Object.getKeys(remoteFiles),
                            commonPaths, commonPathsLength, commonPathIndex = 0, commonPath,
                            changedPaths = [], changedPathsLength, changedPathIndex = 0,
                            deletedPaths = [], deletedPathsLength, deletedPathIndex = 0,
                            path, pathHandles, pathHandle, pathNode, pathChildNode;

                        // find all the local remote files that are still in the remote tree
                        treePanel.setLoading('Intersecting trees&hellip;');
                        commonPaths = Ext.Array.intersect(localRemotePaths, remotePaths);
                        commonPathsLength = commonPaths.length;

                        // find all common paths with non-matching SHA1 hashes
                        treePanel.setLoading('Comparing '+commonPathsLength+' files&hellip;');

                        for (; commonPathIndex < commonPathsLength; commonPathIndex++) {
                            commonPath = commonPaths[commonPathIndex];

                            if (localFiles[commonPath].SHA1 != remoteFiles[commonPath].SHA1) {
                                changedPaths.push(commonPath);
                            }
                        }
                        changedPathsLength = changedPaths.length;

                        console.log('%s changedPaths', changedPathsLength, changedPaths);

                        // find all the local files that have been deleted remotely
                        deletedPaths = Ext.Array.difference(localRemotePaths, remotePaths);
                        deletedPathsLength = deletedPaths.length;

                        console.log('%s deletedPaths', deletedPathsLength, deletedPaths);

                        // build tree
                        treePanel.setLoading('Building tree&hellip;');
                        treePanel.suspendLayouts();

                        // insert changed paths
                        for (; changedPathIndex < changedPathsLength; changedPathIndex++) {
                            path = changedPaths[changedPathIndex];
                            pathHandles = path.split('/');
                            pathNode = changesTreeRoot;

                            while (pathHandle = pathHandles.shift()) {
                                pathChildNode = pathNode.findChild('handle', pathHandle);

                                if (pathChildNode) {
                                    pathNode = pathChildNode;
                                } else if (pathHandles.length) {
                                    pathNode = pathNode.appendChild({
                                        children: [],
                                        handle: pathHandle
                                    }, false, true);
                                } else {
                                    pathNode = pathNode.appendChild({
                                        leaf: true,
                                        checked: false,
                                        handle: pathHandle,
                                        path: path,
                                        localFile: localFiles[path],
                                        remoteFile: remoteFiles[path]
                                    }, true, true);
                                }
                            }
                        }

                        // insert deleted paths
                        for (; deletedPathIndex < deletedPathsLength; deletedPathIndex++) {
                            path = deletedPaths[deletedPathIndex];
                            pathHandles = path.split('/');
                            pathNode = changesTreeRoot;

                            while (pathHandle = pathHandles.shift()) {
                                pathChildNode = pathNode.findChild('handle', pathHandle);

                                if (pathChildNode) {
                                    pathNode = pathChildNode;
                                } else if (pathHandles.length) {
                                    pathNode = pathNode.appendChild({
                                        children: [],
                                        handle: pathHandle
                                    }, false, true);
                                } else {
                                    pathNode = pathNode.appendChild({
                                        leaf: true,
                                        checked: false,
                                        handle: pathHandle,
                                        path: path,
                                        localFile: localFiles[path]
                                    }, true, true);
                                }
                            }
                        }

                        treePanel.expandAll(function() {
                            treePanel.resumeLayouts();
                            treePanel.setLoading(false);
                        });
                    }
                });
            }
        });
    },

    onTreePanelCheckChange: function() {
        this.syncCheckedCount();
    },

    onTreePanelItemClick: function(treeView, record) {
        var diffPanel = this.getDiffPanel(),
            leftCmp = diffPanel.down('#leftSide'),
            rightCmp = diffPanel.down('#rightSide'),
            path = record.get('path'),
            localRevisionId = record.get('localFile').SHA1,
            remoteRevisionId = record.get('remoteFile').SHA1,
            localResponse = false,
            remoteResponse = false;

        if (diffPanel.collapsed || !record.get('leaf')) {
            return;
        }

        // spawn async load of both
        leftCmp.setLoading('Loading local revision&hellip;');
        Emergence.util.API.request({
            url: '/emergence/'+path,
            method: 'GET',
            headers: {
                'X-Revision-ID': localRevisionId
            },
            callback: function(options, success, response) {
                localResponse = response;
                leftCmp.down('#authorBar').update({
                    author: response.getResponseHeader('Author'),
                    timestamp: new Date(response.getResponseHeader('Last-Modified'))
                });
                leftCmp.setLoading(false);
                if (remoteResponse) {
                    _onBothLoaded();
                }
            }
        });

        rightCmp.setLoading('Loading remote revision&hellip;');
        Emergence.util.API.request({
            url: '/emergence/'+path,
            method: 'GET',
            headers: {
                'X-Revision-ID': remoteRevisionId
            },
            params: {
                remote: 'parent'
            },
            callback: function(options, success, response) {
                remoteResponse = response;
                rightCmp.down('#authorBar').update({
                    author: response.getResponseHeader('Author'),
                    timestamp: new Date(response.getResponseHeader('Last-Modified'))
                });
                rightCmp.setLoading(false);
                if (localResponse) {
                    _onBothLoaded();
                }
            }
        });

        // called after both are loaded
        function _onBothLoaded() {
            var leftLines = localResponse.responseText.replace(/\r\n?/g, '\n').split(/\n/),
                rightLines = remoteResponse.responseText.replace(/\r\n?/g, '\n').split(/\n/),
                diff = EmergencePullTool.util.Diff.getDiff(leftLines, rightLines);

            diffPanel.setCode('A', leftLines, diff);
            diffPanel.setCode('B', rightLines, diff);
            diffPanel.loadedJob = {
                leftPath: path,
                leftRevisionId: localRevisionId,
                rightPath: path,
                rightRevisionId: remoteRevisionId
            };
            diffPanel.syncTitles();
        }
    },

    onTreePanelItemDblClick: function(treeView, record) {
        treeView.onCheckChange(record);
    },

    onPullButtonClick: function() {
        var me = this,
            treePanel = me.getTreePanel(),
            checkedNodes = treePanel.getView().getChecked();

        treePanel.setLoading('Pulling '+checkedNodes.length+' updates&hellip;');
        Emergence.util.API.request({
            url: '/efs/pull-remote-changes',
            method: 'POST',
            timeout: 600000,
            jsonData: {
                nodes: Ext.Array.map(checkedNodes, function(node) {
                    var localFile = node.get('localFile');

                    return {
                        path: node.get('path'),
                        localSHA1: localFile.SHA1,
                        remoteSHA1: node.get('remoteFile') ? node.get('remoteFile').SHA1 : null
                    };
                })
            },
            callback: function(options, success, response) {
                var r = Ext.decode(response.responseText);

                treePanel.setLoading(false);
                console.info('%s succeeded: %o', r.succeeded.length, r.succeeded);
                console.info('%s failed: %o', r.failed.length, r.failed);
            }
        });
    },

    onSelectAllClick: function() {
        this.getTreePanel().getRootNode().cascadeBy(function(node) {
            if (Ext.isBoolean(node.get('checked'))) {
                node.set('checked', true)
            }
        });

        this.syncCheckedCount();
    }
});