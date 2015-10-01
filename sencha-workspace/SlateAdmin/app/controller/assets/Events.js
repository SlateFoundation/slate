/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.controller.assets.Events', {
	extend: 'Ext.app.Controller'

    ,views: [
        'assets.details.Events'
        ,'assets.details.event.CreateWindow'
        ,'activity.Create'
    ]
    ,stores: [
		'assets.Activity'
    ]
    ,refs: [{
        ref: 'assetsManager'
        ,selector: 'assets-manager'
        ,xtype: 'assets-manager'
	},{
		ref: 'assetEventPanel'
		,selector: 'assets-details-events'
	},{
//		ref: 'assetEventCreateWindow'
//		,autoCreate: true
//		,selector: 'assets-details-event-createwindow'
//		,xtype: 'assets-details-event-createwindow'
//	},{
		ref: 'activityCreateWindow'
		,autoCreate: true
		,selector: 'activity-create'
		,xtype: 'activity-create'
	}]
	,init: function() {
		var me = this;

		me.control({
            'assets-details-events':{
				activate: {fn:me.onEventsActivate, delay: 10}
            }
            ,'assets-details-events button[action=addAssetActivity]': {
				click: me.onAddAssetActivity
			}
		});

		me.application.on('assetselected', me.onAssetSelected, me);
	}


	//event handlers
	,onEventsActivate: function(){
		var asset = this.getAssetsManager().getAsset();
		//debugger;
		if(asset){
			this.loadAsset(asset);
		}
	}

	,onAddAssetActivity: function(){
		var asset = this.getAssetsManager().getAsset()
			,createWindow = this.getActivityCreateWindow();

		createWindow.setContext(asset);
		createWindow.setSubmitUrl('/assets/json/' + asset.getId() + '/activity/create');
		createWindow.setController('asset.Events');
		createWindow.setHandler('onAssetActivityCreated');

		createWindow.show();
	}

	,onAssetSelected: function(asset) {
		var activeProfileView = this.getAssetsManager().down('#profileTabs').getActiveTab()
			,activeXtype = activeProfileView.xtype
			,eventsView = this.getAssetEventPanel();

		eventsView.enable();
//		ticketsView.setLoaded(false);

		if(activeXtype == eventsView.xtype)
		{
			this.loadAsset(asset);
		}
	}

	,onAssetActivityCreated: function(asset) {
		this.loadAsset(asset);
	}

	//helper functions
	,loadAsset: function(asset){
		var panel = this.getAssetEventPanel();

		Ext.getStore('assets.Activity').load({
			params: {
				ObjectClass: asset.get('Class')
				,ObjectID: asset.get('ID')
			}
		});

		panel.enable();
	}

//	,submitAssetEvent: function(btn){
//
//		var me = this
//			,asset = me.getAssetsManager().getAsset()
//			,form = btn.up('form')
//			,basic = form.getForm();
//
//		if(basic.isValid())
//		{
//			form.setLoading({
//				xtype: 'loadmask'
//				,message: 'Loading&hellip;'
//			});
//
//			form.submit({
//				url: '/assets/json/' + asset.get('ID') + '/notes/create'
//				,success: function(f, action){
//
//					me.getAssetEventCreateWindow().close();
//					basic.reset();
//
//					form.setLoading(false);
//					me.loadAsset(asset);
//				}
//				,failure: function() {
//					form.setLoading(false);;
//				}
//			});
//		}
//	}
});