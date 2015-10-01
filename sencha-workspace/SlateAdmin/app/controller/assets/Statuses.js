/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.asset.Statuses', {
	extend: 'Ext.app.Controller'
	
	,views: [
		'assets.statuses.Manager'
		,'assets.statuses.Menu'
	]
	,stores: [
		'assets.Statuses'
	]
	,refs: [{
		ref: 'assetStatusManager'
		,selector: 'assets-statuses-manager'
		,autoCreate: true
		,xtype: 'assets-statuses-manager'
	},{
		ref: 'statusContextMenu'
		,autoCreate: true
		,selector: 'assets-statuses-menu'
		,xtype: 'assets-statuses-menu'
	},{
		ref: 'assetStatusGrid'
		,selector: 'assets-statuses-grid'
	}]
	,routes: {
		'assets/statuses': 'showAssetStatuses'
	}
	
	,init: function() {
		var me = this;
		
		me.control({
			'assets-statuses-manager': {
				itemcontextmenu: me.onStatusContextMenu
			}
			,'assets-statuses-manager button[action=add-status]': {
				click: me.onAddStatusClick
			}
			,'assets-statuses-menu menuitem[action=create-child-status]': {
				click: me.onCreateChildStatusClick
			}
			,'assets-statuses-menu menuitem[action=delete-status]': {
				click: me.onDeleteStatusClick
			}
		});		
	}
	
	//route handlers
	,showAssetStatuses: function() {
		this.application.loadCard(this.getAssetStatusManager());
	}
	
	//event handlers	
	,onStatusContextMenu: function(tree, record, item, index, ev) {
		ev.stopEvent();
		
		var menu = this.getStatusContextMenu();
		
		menu.setRecord(record);
		menu.showAt(ev.getXY());
	}
	
	,onAddStatusClick: function() {
		Ext.Msg.prompt('Creating Status', 'Enter a name for the new status:', function(btn, text) {
			if(btn == 'ok') {
				var newStatus = Ext.create('Slate.model.AssetStatus', {
					Title: text
					,Class: 'AssetStatus'
					,Status: 'Active'
				});
				
				newStatus.save({
					success: function() {
						Ext.getStore('assets.Statuses').getRootNode().appendChild(newStatus);
					}
				});
			}
		});
	}
	
	,onCreateChildStatusClick: function(menuItem, event) {
		var parentStatus = this.getStatusContextMenu().getRecord()
			,store = Ext.getStore('assets.Statuses');
		
		Ext.Msg.prompt('Creating Status', 'Enter a name for the new status:', function(btn, text) {
			if(btn == 'ok') {
				if(text) {
					var newStatus = Ext.create('Slate.model.AssetStatus', {
						Title: text
						,Class: 'AssetStatus'
						,Status: 'Active'
						,ParentID: parentStatus.get('ID')
					});
					
					newStatus.save({
						success: function() {
							parentStatus.data.leaf = false;
							
							store.load({
								node: parentStatus
								,callback: function(records, operation, success) {
									if(success) {
										parentStatus.expand();
									}
								}
							});
						}
					});
				}
				else {
					Ext.Msg.alert('Didn\'t supply a status name', 'Please supply a status name before submitting.');
				}
			}
		});
	}
	
	,onDeleteStatusClick: function(){			
		var record = this.getStatusContextMenu().getRecord()
			,store = Ext.getStore('assets.Statuses');
			
		Ext.Msg.confirm('Deleting Status', 'Are you sure you want to delete this status?', function(btn){
			if(btn=='yes') {
				var parentNode = record.parentNode;

				if(parentNode.childNodes.length == 1) {
					Ext.Ajax.request({
						url: '/asset_statuses/json/destroy'
						,jsonData: {
							data: [{
								ID: record.get('ID')
							}]
						}
						,success: function(res, opts) {
							var r = Ext.decode(res.responseText);

							if(r.success) {
								store.load({node: parentNode.parentNode});
							}
						}
					});
				}
				else
				{
					record.remove(true);
				}	
			}
		}, this);
	}
	
	,onAssetStatusRemoval: function(store, node) {
		// using node store because supplied store dosen't have a read method
		Ext.getStore('assets.Statuses').load({
			node: node.parentNade
		});
	}
});