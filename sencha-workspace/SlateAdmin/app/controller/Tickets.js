/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Tickets', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'tickets.Activity',
        'tickets.Details',
        'tickets.Grid',
        'tickets.Manager',
        
        'tickets.details.Form'
    ],

    stores: [
        'assets.Tickets',
        'assets.TreeNodes'
    ],

    routes: {
        'tickets': 'showTickets',
        'tickets/all': 'showAllTickets',
        'tickets/lookup/:ticket': 'showTicket',
        'tickets/search/:query': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+'
            }
        },
        'tickets/search/:query/:ticketId': {
            action: 'showResults',
            conditions: {
                ':query': '[^/]+',
                ':ticketId': '[^/\\?]+'
            }
        },
        'tickets/create': {
            action: 'createNewTicket'
        }
    },

    refs: [{
        ref: 'navPanel',
        selector: 'assets-navpanel',
        autoCreate: true,

        xtype: 'assets-navpanel'
    },{
        ref: 'navTreePanel',
        selector: 'assets-navpanel #filters',
        
        autoCreate: true
    },{
        ref: 'searchField',
        selector: 'assets-navpanel searchfield'
    },
    {
        ref: 'manager',
        selector: 'tickets-manager',
        autoCreate: true,

        xtype: 'tickets-manager'
    },{
        ref: 'grid',
        selector: 'tickets-grid'
    },{
        ref: 'activityCt',
        selector: 'tickets-activity',
        autoCreate: true,

        xtype: 'tickets-activity'
    },{
        ref: 'activityCmp',
        selector: 'tickets-activity #activityCmp'
    },{
        ref: 'selectionCountCmp',
        selector: 'tickets-grid #selectionCount'
    },{
        ref: 'detailsForm',
        selector: 'tickets-details-form',
        
        autoCreate: true,
        
        xtype: 'tickets-details-form'
    },{
        ref: 'leaveNoteBtn',
        selector: 'tickets-activity #submitNote'
    },{
        ref: 'activityTextArea',
        selector: 'tickets-activity textareafield'
    },{
        ref: 'batchStatusBtn',
        selector: 'tickets-grid #batchStatus'
    }],


    // controller template methods
    init: function() {
        var me = this;

        me.control({
            
            'assets-navpanel #filters': {
                select: me.onTreePanelNodeSelect
            },

            'tickets-grid': {
                select: { fn: me.onTicketSelect, buffer: 10 },
                beforeselect: { fn: me.onBeforeTicketSelect},
                deselect: { fn: me.onTicketDeselect, buffer: 10},
                batchstatusupdate: me.onGridBatchAction
            },
            
            'tickets-activity textareafield': {
                change: me.onActivityCommentChange
            },
            'tickets-activity #submitNote': {
                click: me.onSubmitActivityNoteClick
            },
            
            '#tickets-details-save-btn': {
                click: me.onSaveTicketDetailsClick
            },
            '#tickets-details-cancel-btn': {
                click: me.onCancelTicketDetailsClick
            },
           
            'tickets-grid #addTicket': {
                click: me.onAddNewTicket
            }
        });
        
    },

    buildNavPanel: function() {
        return null;
    },

    // route handlers
    showAllTickets: function() {
        var me = this,
            ExtHistory = Ext.util.History,
            store = me.getAssetsTicketsStore(),
            proxy = store.getProxy(),
            manager = me.getManager();
            
        ExtHistory.suspendState();
        Ext.suspendLayouts();

        // queue store to load
        proxy.abortLastRequest(true);
                
        delete proxy.extraParams.q;

        //sync search form & treepanel
        me.getSearchField().setValue(null);
        me.syncNavTreePanel();
        
        // activate manager
        me.getApplication().getController('Assets').expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(manager);
 
        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        
        Ext.defer(function() {
            //execute search forcing reload, since there are no "dirty" proxy params.
            me.doSearch(true, function() {
                ExtHistory.resumeState(false);               
            });
        }, 10);  
    },
    
    showTickets: function() {
        var me = this,
            searchField = me.getSearchField(),
            navPanel = me.getNavPanel(),
            treePanel = me.getNavTreePanel(),
            rootTicketNode = treePanel.store.getRootNode().getChildAt(1),
            selectedNode = treePanel.getSelectionModel().getSelection()[0],
            _selectRootNode = function() {
                if (selectedNode && selectedNode.isAncestor(rootTicketNode))
                    return;
                    
                treePanel.getSelectionModel().select(rootTicketNode, false, true);
            };
        
        Ext.suspendLayouts();
        me.getApplication().getController('Assets').expandNavOnRender();
        me.application.getController('Viewport').loadCard(me.getManager());
        Ext.resumeLayouts(true);

        //reset search field & empty grid store
        searchField.setValue(null);
        me.getGrid().getStore().getProxy().setExtraParam("q", null);
        me.getGrid().store.removeAll();
        
        if (treePanel.rendered) {
            _selectRootNode();
        } else {
            treePanel.on('render', _selectRootNode, me, {single: true});
        }
    },
    
    showTicket: function(ticketId) {
        var me = this,
            ExtHistory = Ext.util.History,
            manager = me.getManager(),
            id = ExtHistory.decodeRouteComponent(ticketId),
            
            _onTicketNotFound = function() {
                ExtHistory.resumeState(false);
                return Ext.Msg.alert('Error', 'The ticket you requested could not be found. Please try again', function() {
                   ExtHistory.pushState('tickets');
                });
            },
            _onTicketFound = function(rec) {                
                ExtHistory.resumeState(false);                
                ExtHistory.pushState('tickets/lookup/'+rec.getId());
            };
        
        ExtHistory.suspendState();
        Ext.suspendLayouts();
        
        // activate manager
        me.getApplication().getController('Assets').expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(manager);
        
        me.selectTicket(id, function(ticketRecord) {
            if (ticketRecord) {
                _onTicketFound(ticketRecord);
            } else {
                _onTicketNotFound();
            }
        });
        
        Ext.resumeLayouts(true);
        
    },
    
    showResults: function(query, ticketId) {
        var me = this,
            ExtHistory = Ext.util.History,
            store = me.getAssetsTicketsStore(),
            proxy = store.getProxy(),
            manager = me.getManager();
        
        ExtHistory.suspendState();
        Ext.suspendLayouts();
        
        //decode query string for processing
        query = ExtHistory.decodeRouteComponent(query);
        ticketId = ExtHistory.decodeRouteComponent(ticketId);

        // queue store to load
        proxy.abortLastRequest(true);
        if (query) {            
            proxy.setExtraParam('q', query);
        } else {
            delete proxy.extraParams.q;
        }

        //sync search form & treepanel
        me.getSearchField().setValue(query);
        me.syncNavTreePanel();
        
        // activate manager
        me.getApplication().getController('Assets').expandNavOnRender();
        me.getApplication().getController('Viewport').loadCard(manager);
 
        // resume layouts and insert a small delay to allow layouts to flush before triggering store load so loading mask can size correctly
        Ext.resumeLayouts(true);
        Ext.defer(function() {
            // execute search (suppressed by doSearch if query hasn't changed) and select asset
            me.doSearch(false, function() {
                me.selectTicket(ticketId, function() {
                    ExtHistory.resumeState();
                });
            });
        }, 10);
    },
    
    // event handlers
    onSearchSpecialKey: function(field, ev) {
    
    },
    
    onSaveTicketDetailsClick: function(btn) {
        var me = this,
            form = me.getDetailsForm(),
            ticket = form.getRecord(),
            ticketData = ticket.getData(),
            wasPhantom = ticket.phantom,
            assigneeChanged, statusChanged;
        
        //loadmask
        form.setLoading({
            msg: 'Saving Ticket&hellip;'
        });
        //update record from form
        form.updateRecord();
        
        assigneeChanged = ticket.modified.AssigneeID !== undefined;
        statusChanged = ticket.modified.StatusID !== undefined;
        
        ticket.save({
            callback: function(record, op, succ) {
                var token = Ext.History.getToken(),
                    url = [];
                    
                if (succ) {                
                    
                    me.getManager().updateSelectedTicket(record);
                    me.getGrid().getSelectionModel().deselectAll();
                    me.updateTreeNodesCount(ticketData, record.getData());
                    if(wasPhantom) {
                        form.setLoading(false);
                        me.doSearch();
                    } else {
                        Ext.Function.defer(function() {
                            form.setLoading(false);
                            me.doSearch(true, function() {
                                if (!assigneeChanged && !statusChanged) {
                                }
                                me.selectTicket(record);
                            });   
                        }, 250, me);
                        
                    }
                } else {
                    Ext.Msg.alert('Error', 'There was an error saving the ticket, please try again.');
                    form.setLoading(false);
                }
            },
            scope: me
        });
    },
    
    updateTreeNodesCount: function(old, current) {
        var me = this,
            treePanel = me.getNavTreePanel(),
            treeNodesStore = treePanel.getStore(),
            rootAssigneeNode = treeNodesStore.getRootNode().findChild('queryParam', 'assignee', true),
            rootStatusNode = treeNodesStore.getRootNode().findChild('queryParam', 'tickets-status', true),
            oldAssignee, assignee,
            oldStatus, status,
            _updateNode = function(n, add) {
                n.set('ticketsCount', n.get('ticketsCount') + (add === true ? 1 : -1));
                n.set('qtitle', n.get('ticketsCount'));
                console.log([(add === true ? 'adding' : 'substracting'),'from',n.get('text'),"(",n.get('ticketsCount'),")"].join(' '));
            },
            currentlySelected = treePanel.getSelectionModel().getSelection()[0];
            
            if (old.AssigneeID !== current.AssigneeID) {
                oldAssignee = rootAssigneeNode.findChild('ID', old.AssigneeID, true);
                assignee = rootAssigneeNode.findChild('ID', current.AssigneeID, true);
                
                if (oldAssignee) {                    
                    _updateNode(oldAssignee, false);
                }
                
                if (assignee) {
                    _updateNode(assignee, true);
                } else if (!assignee && current.AssigneeID) {
                    //re-expand node on load, since store callback isnt working :(
                    treeNodesStore.on('load', function() {
                        rootAssigneeNode.expand(false, function() {                            
                            treePanel.getSelectionModel().select(currentlySelected, false, true);
                        });
                    }, null, {single: true});
                    treeNodesStore.load({
                        node: rootAssigneeNode                        
                    });
                }
            }
            
            if (old.Status !== current.Status) {
                oldStatus = rootStatusNode.findChild('text', old.Status, true);
                status = rootStatusNode.findChild('text', current.Status, true);
                
                if (oldStatus) {
                        _updateNode(oldStatus, false);
                }
                
                if (status) {
                    _updateNode(status, true);
                }
            }
    },
    
    onCancelTicketDetailsClick: function(btn) {
        var me = this,
            form = me.getDetailsForm(),
            ticket = form.getSelectedTicket();
            
        form.updateSelectedTicket(ticket);
    },
    
    //todo override assets ctrl version
    doSearch: function(forceReload, callback) {
        var me = this,
            store = Ext.getStore('assets.Tickets'),
            proxy = store.getProxy();

        if (forceReload || proxy.isExtraParamsDirty()) {
            me.getManager().updateSelectedTicket(null);
            me.syncGridStatus();
            store.removeAll();
            
            store.load({
                callback: callback,
                scope: me
            });
        } else {
            Ext.callback(callback, me);
        }
    },
    
    onStoreLoad: function(store) {
        this.syncGridStatus();  
    },

    syncState: function() {
        var me = this,
            manager = me.getManager(),
            selModel = me.getGrid().getSelectionModel(),
            ticketRecord = manager.getSelectedTicket(),
            extraParams = me.getAssetsTicketsStore().getProxy().extraParams,
            path = ['tickets'],
            title = 'Tickets';
          
        if (extraParams && extraParams.q) {
            path.push('search', extraParams.q);
            title = '&ldquo;' + extraParams.q + '&rdquo;';
            if (ticketRecord)
                path.push(ticketRecord.getId().toString());
        } else if (ticketRecord) {
            path.push('lookup');
            
            if (ticketRecord.get('Name')) {
                title = ticketRecord.get('Name');
            }
           path.push(ticketRecord.get('ID').toString());
        } else {
            path.push('all');
            title = 'All Tickets';
        }
        
        Ext.util.History.pushState(path, title);
    },
    
    syncGridStatus: function() {
        var me = this,
            grid = me.getGrid(),
            selectionCountCmp = me.getSelectionCountCmp(),
            selectionCount = grid.getSelectionModel().getCount(),
            actionCount = selectionCount || grid.getStore().getTotalCount(),
            hideBulkEditBtns = selectionCount >= 2;

//        Ext.suspendLayouts();

        // update footer labels/buttons
        if (selectionCount >= 1) {
            selectionCountCmp.setText(selectionCount + (selectionCount==1?' ticket':' tickets') + ' selected:');
            selectionCountCmp.show();
            
        } else {
            selectionCountCmp.hide();
        }

        // disable any components marked bulkOnly unless multiple rows are selected
        Ext.each(grid.query('toolbar [bulkOnly]'), function(editBtn) {
            editBtn.setDisabled(!hideBulkEditBtns);
        });

//        Ext.resumeLayouts();
    },
    
    /**
     * Selects an asset (or clears selection) and updates grid+manager state without firing any select/deselect events
     */
     
    selectTicket: function(ticket, callback) {
        var me = this,
            manager = me.getManager(),
            grid = me.getGrid(),
            form = me.getDetailsForm(),
            store = Ext.getStore('assets.Tickets'),//grid.getStore(),
            selModel = grid.getSelectionModel(),
            ticketRecord, queryParts, fieldName, fieldValue,
            _finishSelectTicket;
            
        _finishSelectTicket = function() {
            
            manager.setSelectedTicket(ticketRecord || null);    
            
            if (ticketRecord) {
                selModel.select(ticketRecord, false, true);
            } else {
                selModel.deselectAll(true);
            }
            
            me.syncGridStatus();
            me.syncState();
            Ext.callback(callback, me, [ticketRecord]);
        };

        if (!ticket) {
           _finishSelectTicket();
        } else if (Ext.isString(ticket) && ticket.charAt(0) != '?') {
            ticketRecord = store.findRecord('ID', ticket);

            if (ticketRecord) {
                _finishSelectTicket();
            } else {
                store.load({
                    url: '/tickets/'+ticket,
                    
                    callback: function(records, operation, success) {
                        if (!success || !records.length) {
                            Ext.Msg.alert('Error', 'Could not find the ticket you requested');
                        } else {
                            ticketRecord = records[0];
                        }

                        _finishSelectTicket();
                    }
                });
            }
        } else if (Ext.isString(ticket)) {
            fieldName = 'id';
            fieldValue = ticket;

            if (fieldName == 'id') {
                ticketRecord = store.getById(parseInt(fieldValue, 10));

                if (ticketRecord) {
                    _finishSelectTicket();
                } else {
                    store.load({
                        url: '/tickets/'+fieldValue,

                        callback: function(records, operation, success) {
                            if (!success || !records.length) {
                                Ext.Msg.alert('Error','Could not find the asset you requested');
                            } else {
                                ticketRecord = records[0];
                            }

                            _finishSelectTicket();
                        }
                    });
                }
            } else {
                Ext.Msg.alert('Error', 'Unknown asset field: '+fieldName);
                _finishSelectTicket();
            }
        } else {
            ticketRecord = ticket;
            _finishSelectTicket();
        }
    },
    
    onBeforeTicketSelect: function(selModel, record, index) {
        var me = this,
            form = me.getDetailsForm();

        if (selModel.getCount() == 1 && form.isDirty()) {

            Ext.Msg.confirm('Cancel Edit?', 'Are you sure you want to cancel editing this ticket?', function(answer) {
                if (answer == 'yes') {
                    selModel.select(record);
                }
            }, me);
            
            return false;
        }
    },
    
    onTicketSelect: function(selModel, record, index) {
        var me = this,
            selectionCount = selModel.getCount();

        Ext.suspendLayouts();
        me.syncGridStatus();
         
        if (selectionCount == 1) {
            me.getManager().setSelectedTicket(record);
            me.syncState();
        }
        
        Ext.resumeLayouts(true);

    },
    
    onTicketDeselect: function(selModel, record, index) {
        var me = this,
            firstRecord,
            token;

        Ext.suspendLayouts();
        me.syncGridStatus();

        if (selModel.getCount() == 1) {
            firstRecord = selModel.getSelection()[0];
            me.onTicketSelect(selModel, firstRecord, firstRecord.index);
        } else {
            me.getManager().setSelectedTicket(null);
            me.syncState();
        }
        
        Ext.resumeLayouts(true);
    },
    
    /**
     * Updates the query string field from the search form and treepanel
    */
    syncQueryField: function(execute) {
        var me = this,
            searchField = me.getSearchField(),
            selectedNodes = me.getNavTreePanel().getSelectionModel().getSelection(),
            selectedNode, rootHash, queryParam, url,
            fieldName, fieldValue,
            query = searchField.getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term, splitTerm,
            unmatchedTerms = [],
            queuedTerms = [];

        // add selected node to query if not a generated node
        if (selectedNodes.length > 0) {
            
            selectedNode = selectedNodes[0];
            
            url = selectedNode.getUrl();
            rootHash = url.split('/').splice(1).shift();
            queryParam = selectedNode.getQueryParam();
            fieldValue = selectedNode.getQueryValue();
            
            if (fieldValue && queryParam) {
                query = queryParam+':'+fieldValue;
            } else {
                query = null;
            }
        }


        searchField.setValue(query);
//        Ext.defer(function() {
            me.syncNavTreePanel();
//        }, 500, me);

        if (execute) {
            Ext.util.History.add(query ? [rootHash, 'search', query] : [rootHash, 'all']);
        }
    },
    
    /**
     * Searches the nav tree panel from the query string field and selects the node.
     */
     //handled in assets ctrl
    syncNavTreePanel: function() {
        var me = this,
            navTreePanel = me.getNavTreePanel(),
            rootNode = navTreePanel.getRootNode().getChildAt(1),
            query = me.getSearchField().getValue(),
            terms = query.split(/\s+/),
            termsLen = terms.length, termIndex = 0, term,
            values = {},
            ancestorNode, node, nodeHandle,
            queryParam,
            searchParam,
            _afterNodeExpand;
            
        _afterNodeExpand = function() {
            Ext.resumeLayouts();
            
            if (node) {
                navTreePanel.getSelectionModel().select(node, false, true);
            } else {
                navTreePanel.getSelectionModel().select(rootNode, false, true);
            }
            
            navTreePanel.resumeEvents();
        };
        
        if (!navTreePanel.rendered) {
            return navTreePanel.on('render', function() {
                return me.syncNavTreePanel();
            }, me, {single: true});
            
        }

        // build map of keyed search terms
        for (; termIndex < termsLen; termIndex++) {
            term = terms[termIndex].split(/:/, 2);
            if (term.length == 2) {
                values[term[0]] = term[1];
            }
        }

        // sync treepanel selection
        if (values['tickets-status']) {
            queryParam = 'tickets-status';
            ancestorNode = rootNode.findChild('queryParam', queryParam, true);
            searchParam = 'ID';
        } else if (values.assignee) {
            queryParam = 'assignee';
            ancestorNode = rootNode.findChild('queryParam', queryParam, true);
            searchParam = 'Username';
        }
        
        if (ancestorNode) {
            
            if (!ancestorNode.isLoaded()) {
                Ext.resumeLayouts();
                return ancestorNode.expand(false, function() {
                    return me.syncNavTreePanel();
                });
            }
            
            node = ancestorNode.findChild(searchParam, values[queryParam], true);
                
            if (node) {
                navTreePanel.suspendEvents();
                navTreePanel.expandPath(node.parentNode.getPath(), null, null, _afterNodeExpand, me);
            } else {
                navTreePanel.getSelectionModel().select(ancestorNode, false, true);
            }
        } else {
            Ext.resumeLayouts();
            _afterNodeExpand();
        }
    },
    
    //handled in assets ctrl
    onBeforeTreePanelNodeSelect: function(treePanel, record) {

    },
    
    onTreePanelNodeSelect: function(treePanel, record, index) {
        
        var me = this,
            acceptableClasses = ['ticket', 'user', 'person'];
    
        //TODO: check if node is descendent of root ticket node
        //cancel if not an asset node.
        if (acceptableClasses.indexOf(record.get('Class').split('\\').pop().toLowerCase()) === -1) {
            return;
        }
        
        //return false if record was dbl clicked and already being handled.
        if (record.isExpandable() && record.isLoading()) {
            return false;    
        }
        
        //return false if node is a "filter".
        if (record.getQueryParam(false)) {
            return false;
        } 
        
        me.syncQueryField(true);
        
    },
    
    onActivityCommentChange: function(textArea, newValue, oldValue) {
        var me = this,
            submitBtn = me.getLeaveNoteBtn();
        
        if (newValue) {
            submitBtn.enable();
        } else {
            submitBtn.disable();
        }   
    },
    
    onSubmitActivityNoteClick: function() {
        var me = this,
            note = me.getActivityTextArea().getValue(),
            ticket = me.getManager().getSelectedTicket(),
            photos;
        
        if (note) {            
            me.createActivityNote(note, ticket);
        } 
    },
    
    createActivityNote: function(note, ticket) {
        var me = this,
            manager = me.getManager(),
            activityCt = me.getActivityCt(),
            dataview = activityCt.down('dataview'),
            
            xhr = new XMLHttpRequest(),
            formData = new FormData(),
            mediaFiles = dataview.store.data.items,
            keepFiles = [],
            _onActivityCreated; 
            
        _onActivityCreated = function(event) {
            var response = Ext.decode(event.currentTarget.response),
                activity;
            
            if (response.success === false) {                                
                Ext.Msg.alert('Error', 'There was an error updating the activity. Please try again.');
            }
            
            if (response.failed) {
                Ext.iterate(response.failed, function(fileName, error) {
                    activity = dataview.store.findRecord('filename', fileName);
                    if (activity) {
                        activity.set('error', response.failed[filename]);
                    }
                }, me);
                
                Ext.each(mediaFiles, function(activity) {
                    if(activity && !activity.get('error')) {
                        activity.destroy();
                    }
                });
            }
            
            me.updateSelectedTicketActivity();
            
        };
        
        xhr.open('POST','/tickets/'+ticket.getId()+'/activity/create?format=json');
        xhr.onload = Ext.bind(_onActivityCreated, me);
        
        Ext.each(mediaFiles, function(mediaFile, i) {
            formData.append('mediaUpload['+i+']', mediaFile.raw.file);
        }, me);
        
        formData.append('Note', note);
        
        xhr.send(formData);

    },
    
    updateSelectedTicketActivity: function() {
        var me = this,
            manager = me.getManager(),
            ticket = manager.getSelectedTicket();
            
        if (!ticket || ticket.phantom) {
            return;
        }
            
        Ext.Ajax.request({
            url: '/tickets/'+ticket.getId()+'/activity',
            method: 'GET',
            scope: me,
            params: {
                format: 'json',
                'include[]': [
                    'Actor',
                    'Media',
                    'changes'
                ]
            },
            success: function(response, opts) {
                var responseData = Ext.decode(response.responseText);
                ticket.beginEdit();
                ticket.set('Stories', responseData.data);
                ticket.commit();
                return manager.updateSelectedTicket(ticket);
            }
        });
    },
    
    onGridBatchAction: function(grid, menu, item) {
        var me = this,
            form = me.getDetailsForm(),
            status = item.text,
            ticketData, ticketNewData,
            tickets = [];
        
        if (form.isDirty()) {
            Ext.Msg.alert('Please save or cancel changes to the selected ticket, and try again.');
            return;
        }
        
        Ext.each(grid.getSelectionModel().getSelection(), function(ticket) {
            ticketData = {
                Status: ticket.get('Status'),
                Assignee: false
            };
            
            ticket.beginEdit();
            ticket.set('Status', status);
            ticket.endEdit();
            
            ticketNewData = {Status: status, Assignee: false};
            
            tickets.push({
                ID: ticket.get('ID'),
                Status: status
            });
            
            me.updateTreeNodesCount(ticketData, ticketNewData);
        }, me);
        
        Ext.Ajax.request({
            url: '/tickets/save?format=json',
            jsonData: {
                data: tickets
            },
            success: function(response, opts) {
                var token = Ext.History.getToken(),
                    splitToken = token.split('/');
                    
                grid.getSelectionModel().deselectAll(true);
                me.syncGridStatus();
                
                if(splitToken.length && Ext.isNumeric(splitToken[splitToken.length-1])) {
                    splitToken.pop();
                    Ext.History.add(splitToken, true);
                }

                me.doSearch(true, function() {
                });
                
            },
            failure: function(response, opts) {
                Ext.Msg.alert('Error', 'There was an error updating the selected tickets, please try again.');
            }
        });
    },
    
    onAddNewTicket: function(btn) {
        var me = this,
            ticket = Ext.ModelMgr.create({}, 'SlateAdmin.model.asset.Ticket');
        
        if(me.getDetailsForm().isDirty()) {
            return;
        }
        
        Ext.History.pushState(['tickets', 'create'], 'Create Ticket');
    },
    
    createNewTicket: function() {
        var me = this,
            ticket = Ext.ModelMgr.create({}, 'SlateAdmin.model.asset.Ticket');
        
        me.showTickets();
        
        me.getActivityCt().disable();
        me.getManager().updateSelectedTicket(ticket);
//        me.getDetailsForm().setSelectedTicket(ticket);
        me.getDetailsForm().down('textfield').focus(100);
    }
    
});