/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.Assets', {
	extend: 'Ext.app.Controller'

	,views: [
		'assets.Navigation'
		,'assets.Manager'
	]

	,stores: [
		'assets.Assets'
		,'AssetLocations'
		,'AssetStatuses'
	]

	,refs: [{
		ref: 'assetsManager'
		,selector: 'assets-manager'
		,autoCreate: true

		,xtype: 'assets-manager'
	},{
		ref: 'assetEditor'
		,selector: 'assets-editor'
	},{
		ref: 'assetHeader'
		,selector: 'assets-header'
	},{
		ref: 'assetsSearchField'
		,selector: 'assets-navpanel textfield[inputType=search]'
	},{
		ref: 'createForm'
		,selector: 'assets-navpanel #create-form'
	},{
		ref: 'assetsGrid'
		,selector: 'assets-grid'
	},{
		ref: 'assetsNavPanel'
		,selector: 'assets-navpanel'
	}]

	,routes: {
		'assets': 'showAssets'
		,'assets/:asset': {
			action: 'showAssets'
			,conditions: {
				':asset': '[tickets|statuses|locations]'
			}
		}
		,'assets/search/:query': {
			action: 'showResults'
			,conditions: {
				':query': '[^/]+'
			}
		}
		,'assets/search/:query/:asset': {
			action: 'showResults'
			,conditions: {
				':query': '[^/]+'
				,':asset': '.+'
			}
		}
	}

	,init: function() {
		var me = this;

		me.control({
			'assets-manager': {
				activate: {fn: me.onActivate, delay: 10}
			}
			,'assets-navpanel textfield[inputType=search]': {
				specialkey: me.onSearchSpecialKey
			}
			,'assets-grid': {
				select: me.onAssetSelect
				,deselect: me.onAssetDeselect
			}
			,'assets-grid button[action=bulk-edit] menuitem': {
				click: me.onBulkEditClick
			}
			,'assets-navpanel button[action=create]': {
				click: me.onCreateClick
			}
		});
	}

	,buildNavPanel: function() {
		return 'assets-navpanel';
	}


	//route handlers
	,showAssets: function(asset) {
		var me = this
			,viewportCt = me.application.getController('Viewport').getCardCt()
			,layout = viewportCt.getLayout()
			,assetsManager = me.getAssetsManager()
			,searchField =  me.getAssetsNavPanel().down('form #searchField');

		searchField.reset();

		if(layout.getActiveItem() != assetsManager) {
            me.getAssetsNavPanel().expand();
            me.application.getController('Viewport').loadCard(assetsManager);
		}

		if(asset) {
			me.selectAsset(asset);
		}
		else {
			me.doSearch(true);
		}
	}

	,showResults: function(query, asset){
		var me = this
			,store = Ext.getStore('assets.Assets')
			,assetsManager = me.getAssetsManager()
			,proxy = store.getProxy()
			,viewportCt = me.application.getController('Viewport').getCardCt()
			,layout = viewportCt.getLayout()
			,searchField =  me.getAssetsNavPanel().down('form #searchField');


		//decode query string for processing
		query = Ext.util.History.decodeRouteComponent(query);

		// queue store to load
		proxy.abortLastRequest(true);
		proxy.setExtraParam('q', query);


		//sync search form
		searchField.setValue(query);

		if(layout.getActiveItem() != assetsManager) {
			me.application.loadCard(assetsManager);
		}

		if(asset) {
			me.selectPerson(asset);
		} else {
			proxy.markParamsDirty();
			me.doSearch();
		}
	}

	// event handlers
	,onActivate: function() {
		var me = this
			,grid = me.getAssetsGrid()
			,bulkEditBtns = grid.query('button[action=bulk-edit]');

		Ext.each(bulkEditBtns, function(editBtn){
			var store = Ext.getStore(editBtn.store);

			if(!store.isLoaded() && !store.isLoading()) {

				editBtn.setLoading(true);

				store.load({
					callback: function(records, operation, success) {
						me.doLoadMenuItems(records, editBtn);
					}
				});
			}
		});
	}

	,onSearchSpecialKey: function(field, ev) {
		if(ev.getKey() == ev.ENTER) {
			// debugger;
			Ext.util.History.add('assets/search/'+this.encodeHashString(field.getValue()));
		}
	}

	,onAssetSelect: function(selModel, record, index) {
		var me = this
			,path = 'assets/'
			,selectionCount = selModel.getCount()
			,grid = me.getAssetsGrid();

		me.syncGridStatus();

		if (selectionCount == 1) {
			if (me.loadedQuery) {
				path += 'search/'+me.encodeHashString(me.loadedQuery)+'/';
			}

			me.getAssetsManager().setAsset(record);

			Ext.util.History.add(path+record.get('ID'));

			me.application.fireEvent('assetselected', record, me);
		}
	}

	,onAssetDeselect: function(selModel, record, index) {
		var me = this
			,firstRecord;

		me.syncGridStatus();

		if (selModel.getCount() == 1) {
			firstRecord = selModel.getSelection()[0];
			me.onAssetSelect(selModel, firstRecord, firstRecord.index);
		}
	}

	,onBulkEditClick: function(menuItem) {
		var me = this
			,grid = me.getAssetsGrid()
			,gridStore = grid.getStore()
			,bulkField = menuItem.up('button').bulkField
			,selections = grid.getSelectionModel().getSelection();

		Ext.each(selections, function(selection) {
			selection.set(bulkField, menuItem.value);
		});

		grid.setLoading('Syncing Records &hellip;');

		gridStore.sync({
			callback: function() {
				grid.setLoading(false);
			}
		});

	}

	,onCreateClick: function() {
		var me = this
			,grid = me.getAssetsGrid()
			,form = me.getCreateForm()
			,values = form.getValues()
			,assetRecord;

		if(!values.Name && !values.MfrSerial) {
			Ext.Msg.alert('Unable to create asset', 'You must enter at least one identifier to create a new asset');
			return;
		}

		grid.setLoading('Adding Asset&hellip;');

		values.Class = 'Asset';
		assetRecord = Ext.create('Slate.model.asset.Asset', values);

		assetRecord.save({
			success: function(record) {
				me.application.loadCard(me.getAssetsManager());
				me.getAssetsStore().add(record);
				grid.setLoading(false);

			}
			,failure: function(record, operation) {
				var r = Ext.decode(operation.response.responseText);

				grid.setLoading(false);

				if(r.error == 'aliasAssigned')
				{
					Ext.Msg.alert('Serial In Use', 'This serial is already assigned to another asset. Please choose another.');
				}
				else
				{
					Ext.Msg.alert('Failed to save to server', operation.getError() || 'Check your connection and try again');
				}
			}
		});
	}


	// helper functions
	,selectAsset: function(asset) {
		var me = this
			,grid = me.getAssetsGrid()
			,selModel = grid.getSelectionModel()
			,store = Ext.getStore('assets.Assets');

		if(!asset) {
			selModel.deselectAll();
			me.loadingAsset = false;

			if(store.getCount() <= 1)
				store.loadPage(1);

			return true;
		} else if(Ext.isString(asset)) {
			var assetRecord = store.findExact('ID', parseInt(asset));

			if(assetRecord >= 0) {
				selModel.select(assetRecord, false, true);
			} else {
				store.loadPage(1,{
					url: '/assets/json/'+asset
					,callback: function(records, operation, success) {
						if(!success || !records.length)
							Ext.Msg.alert('Error','Could not find the asset you requested');
						else
							selModel.select(records[0]);
					}
					,scope: me
				});
			}
			me.loadingAsset = false;
			return true;
		} else {
			selModel.select(asset);
			me.loadingAsset = false;
			return true;
		}

		return false;
	}

	,doSearch: function(forceReload, callback) {
		var store = Ext.getStore('assets.Assets')
			,proxy = store.getProxy();

		if(forceReload || proxy.isExtraParamsDirty()) {
			proxy.abortLastRequest(true);
			store.removeAll();
			store.loadPage(1 , {
				callback: callback
				,scope: this
			});
		}
	}

	,doLoadMenuItems: function(records, editBtn) {
		var me = this
			,grid = me.getAssetsGrid()
			,btnMenu = editBtn.menu;

		Ext.each(records, function(record){
			//Status and Location should have the same status names
			if(record.data.Status == 'Active' || record.data.Status == 'Live') {
				btnMenu.add([{text: record.data.Title, value: record.data.ID}]);
			}
		});

		editBtn.setLoading(false);
	}

	,syncGridStatus: function() {
		var me = this
			,grid = me.getAssetsGrid()
			,selectionCountCmp = grid.down('#selectionCount')
			,selectionCount = grid.getSelectionModel().getCount()
			,hideBulkEditBtns = selectionCount >= 2;

		if (selectionCount >= 1) {
			selectionCountCmp.setText(selectionCount + (selectionCount==1?' item':' items') + ' selected');
			selectionCountCmp.show();
		} else {
			selectionCountCmp.hide();
		}

		Ext.each(grid.query('toolbar [bulkOnly]'), function(editBtn) {
			editBtn.setDisabled(!hideBulkEditBtns);
		});
	}

	,decodeHashString: function(string) {
		return unescape(string).replace(/\++/g,' ');
	}

	,encodeHashString: function(string) {
		return escape(string.replace(/\s+/g,'+'));
	}
});
