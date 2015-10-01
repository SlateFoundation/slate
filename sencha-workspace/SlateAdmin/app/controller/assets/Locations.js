/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.asset.Locations', {
	extend: 'Ext.app.Controller'
	
	,views: [
		'assets.locations.Manager'
		,'assets.locations.Menu'
	]
	,stores: [
		'assets.Locations'
	]
	,refs: [{
		ref: 'assetLocationManager'
		,selector: 'assets-locations-manager'
		,autoCreate: true
		,xtype: 'assets-locations-manager'
	},{
		ref: 'locationContextMenu'
		,autoCreate: true
		,selector: 'assets-locations-menu'
		,xtype: 'assets-locations-menu'
	}]
	,routes: {
		'assets/locations': 'showAssetLocations'
	}
	
	,init: function() {
		var me = this;
		
		me.control({
			'assets-locations-manager': {
				itemcontextmenu: me.onLocationContextMenu
			}

			,'assets-locations-manager button[action=add-location]': {
				click: me.onAddLocationClick
			}
			,'assets-locations-menu menuitem[action=create-child-location]': {
				click: me.onCreateChildLocationClick
			}
			,'assets-locations-menu menuitem[action=delete-location]': {
				click: me.onDeleteLocationClick
			}
		});
	}
	
	//route handlers
	,showAssetLocations: function() {
		this.application.loadCard(this.getAssetLocationManager());
	}
	
	//event handlers
	,onLocationContextMenu: function(tree, record, item, index, ev) {
		ev.stopEvent();
		
		var menu = this.getLocationContextMenu();
		
		menu.setRecord(record);
		menu.showAt(ev.getXY());
	}
	
	,onAddLocationClick: function() {
		Ext.Msg.prompt('Creating Asset Location', 'Enter a name for the new asset location:', function(btn, text) {
			if(btn == 'ok') {
				var newLocation = Ext.create('Slate.model.Location', {
					Title: text
					,Class: 'AssetLocation'
					,Status: 'Live'
				});
				
				newLocation.save({
					success: function() {
						Ext.getStore('assets.Locations').getRootNode().appendChild(newLocation);
					}
				});
			}
		});
	}
	
	,onCreateChildLocationClick: function(menuItem, event) {
		var parentLocation = this.getLocationContextMenu().getRecord()
			,store = Ext.getStore('assets.Locations');
		
		Ext.Msg.prompt('Creating Status', 'Enter a name for the new status:', function(btn, text) {
			if(btn == 'ok') {
				var newLocation = Ext.create('Slate.model.Location', {
					Title: text
					,Class: 'AssetLocation'
					,Status: 'Live'
					,ParentID: parentLocation.get('ID')
				});
				
				newLocation.save({
					success: function() {
						parentLocation.data.leaf = false;
						
						store.load({
							node: parentLocation
							,callback: function(records, operation, success) {
								if(success) {
									parentLocation.expand();
								}
							}
						});
					}
				});
			}
		});
	}
	
	,onDeleteLocationClick: function(){			
		var record = this.getLocationContextMenu().getRecord()
			,store = Ext.getStore('assets.Locations');;
			
		Ext.Msg.confirm('Deleting Location', 'Are you sure you want to delete this location?', function(btn){
			if(btn=='yes') {		
				var parentNode = record.parentNode;
				
				if(parentNode.childNodes.length == 1) {
					Ext.Ajax.request({
						url: '/locations/json/destroy'
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
	
	// path handlers
	,handleNav: function(path) {
		var me = this;
					
		switch(path[0]){
			
			case '':
			default:	
				if(path[0])
					me.loadingStatus = true;
				
				me.application.loadCard(me.getAssetLocationManager());
				return true;
//				return me.selectAssetTicket(path[0]);
		}
	}
});